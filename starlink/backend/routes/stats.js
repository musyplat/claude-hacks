import { Router } from 'express';
import { getStats } from '../db.js';

const router = Router();

// GET /api/stats
router.get('/', (req, res) => {
  try {
    const stats = getStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
