import { Router } from 'express';
import {
  getAllConnections,
  getConnectionsByUserId,
  getConnectionById,
  getUserById,
} from '../db.js';
import { generateConnectionCard } from '../ai-cards.js';

const router = Router();

// GET /api/connections
router.get('/', (req, res) => {
  try {
    const connections = getAllConnections();
    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections/user/:id
router.get('/user/:id', (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const connections = getConnectionsByUserId(req.params.id);
    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/connections/:id
router.get('/:id', (req, res) => {
  try {
    const connection = getConnectionById(req.params.id);
    if (!connection) return res.status(404).json({ error: 'Connection not found' });

    const userA = getUserById(connection.user_a_id);
    const userB = getUserById(connection.user_b_id);

    if (!userA || !userB) {
      return res.status(404).json({ error: 'One or more users not found' });
    }

    const card = generateConnectionCard(userA, userB, connection);

    res.json({
      connection,
      user_a: userA,
      user_b: userB,
      card,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
