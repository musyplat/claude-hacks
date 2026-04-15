import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getUserById,
  createExchange,
  updateExchange,
  getExchangesByProposerId,
} from '../db.js';

const router = Router();

const VALID_STATUSES = ['pending', 'accepted', 'declined', 'completed', 'cancelled'];
const RATE_LIMIT_PER_DAY = 5;

function stripHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 100);
}

// POST /api/exchanges
router.post('/', (req, res) => {
  try {
    const { proposer_id, receiver_id, proposer_gives, receiver_gives, location, time_slot } = req.body;

    if (!proposer_id || !receiver_id || !proposer_gives || !receiver_gives) {
      return res.status(400).json({
        error: 'proposer_id, receiver_id, proposer_gives, and receiver_gives are required',
      });
    }

    if (proposer_id === receiver_id) {
      return res.status(400).json({ error: 'proposer and receiver must be different users' });
    }

    const proposer = getUserById(proposer_id);
    if (!proposer) return res.status(404).json({ error: 'Proposer not found' });

    const receiver = getUserById(receiver_id);
    if (!receiver) return res.status(404).json({ error: 'Receiver not found' });

    // Rate limit: max 5 proposals per day per user
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const recentExchanges = getExchangesByProposerId(proposer_id, oneDayAgo);

    if (recentExchanges.length >= RATE_LIMIT_PER_DAY) {
      return res.status(429).json({
        error: `Rate limit exceeded: max ${RATE_LIMIT_PER_DAY} proposals per 24 hours`,
        proposals_today: recentExchanges.length,
      });
    }

    const exchange = createExchange({
      id: uuidv4(),
      proposer_id,
      receiver_id,
      proposer_gives: stripHTML(String(proposer_gives)),
      receiver_gives: stripHTML(String(receiver_gives)),
      location: location ? stripHTML(String(location)) : null,
      time_slot: time_slot ? stripHTML(String(time_slot)) : null,
      status: 'pending',
      rating_proposer: null,
      rating_receiver: null,
      created_at: new Date().toISOString(),
    });

    res.status(201).json(exchange);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/exchanges/:id
router.patch('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { status, location, time_slot, rating_proposer, rating_receiver } = req.body;

    const updates = {};

    if (status !== undefined) {
      if (!VALID_STATUSES.includes(status)) {
        return res.status(400).json({
          error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`,
        });
      }
      updates.status = status;
    }

    if (location !== undefined) updates.location = stripHTML(String(location));
    if (time_slot !== undefined) updates.time_slot = stripHTML(String(time_slot));

    if (rating_proposer !== undefined) {
      const rating = parseInt(rating_proposer, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating_proposer must be an integer 1-5' });
      }
      updates.rating_proposer = String(rating);
    }

    if (rating_receiver !== undefined) {
      const rating = parseInt(rating_receiver, 10);
      if (isNaN(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ error: 'rating_receiver must be an integer 1-5' });
      }
      updates.rating_receiver = String(rating);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    const updated = updateExchange(id, updates);
    if (!updated) return res.status(404).json({ error: 'Exchange not found' });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
