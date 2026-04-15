import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getCohorts,
  getCohortById,
  getCohortByCode,
  createCohort,
  addCohortMember,
  getCohortMembers,
  getCohortConnections,
} from '../db.js';

const router = Router();

function generateAccessCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// GET /api/cohorts — list all cohorts with member_count
router.get('/', (req, res) => {
  try {
    const cohorts = getCohorts();
    res.json(cohorts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cohorts/:id — cohort detail + members
router.get('/:id', (req, res) => {
  try {
    const cohort = getCohortById(req.params.id);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });
    const members = getCohortMembers(req.params.id);
    res.json({ ...cohort, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cohorts — create a new cohort
router.post('/', (req, res) => {
  try {
    const { name, description, organizer_name, access_code } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const code = access_code || generateAccessCode();
    const cohort = createCohort({
      id: uuidv4(),
      name,
      description: description || null,
      access_code: code,
      organizer_name: organizer_name || null,
      created_at: new Date().toISOString(),
    });

    res.status(201).json(cohort);
  } catch (err) {
    if (err.message && err.message.includes('UNIQUE')) {
      return res.status(409).json({ error: 'Access code already in use' });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/cohorts/join — join a cohort by access_code
router.post('/join', (req, res) => {
  try {
    const { access_code, user_id } = req.body;
    if (!access_code || !user_id) {
      return res.status(400).json({ error: 'access_code and user_id are required' });
    }

    const cohort = getCohortByCode(access_code);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found — check your access code' });

    addCohortMember(cohort.id, user_id);
    const members = getCohortMembers(cohort.id);
    res.json({ ...cohort, members });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cohorts/:id/users — all users in the cohort
router.get('/:id/users', (req, res) => {
  try {
    const cohort = getCohortById(req.params.id);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });
    const members = getCohortMembers(req.params.id);
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/cohorts/:id/connections — connections where both users are in this cohort
router.get('/:id/connections', (req, res) => {
  try {
    const cohort = getCohortById(req.params.id);
    if (!cohort) return res.status(404).json({ error: 'Cohort not found' });
    const connections = getCohortConnections(req.params.id);
    res.json(connections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
