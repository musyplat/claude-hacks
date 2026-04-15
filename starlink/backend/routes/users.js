import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import {
  getAllUsers,
  getUserById,
  createUser,
  createConnection,
} from '../db.js';
import { computeConnectionsForUser } from '../matching.js';

const router = Router();

const COLORS = [
  '#4fc3f7', '#ff8a65', '#ce93d8', '#a5d6a7', '#fff176',
  '#f48fb1', '#80cbc4', '#ffcc02', '#b39ddb', '#4db6ac',
  '#ef9a9a', '#90caf9', '#ffe082', '#c5e1a5', '#f0a500',
  '#80deea', '#bcaaa4', '#ff7043', '#7986cb', '#26c6da',
];

function randomSpherePoint(radius) {
  const theta = Math.random() * 2 * Math.PI;
  const phi = Math.acos(2 * Math.random() - 1);
  const r = radius * Math.cbrt(Math.random());
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
  };
}

function stripHTML(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/<[^>]*>/g, '').trim().slice(0, 50);
}

function sanitizeArray(arr, maxItems = 5) {
  if (!Array.isArray(arr)) return [];
  return arr
    .slice(0, maxItems)
    .map(item => stripHTML(String(item)))
    .filter(Boolean);
}

// GET /api/users
router.get('/', (req, res) => {
  try {
    const users = getAllUsers();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/users/:id
router.get('/:id', (req, res) => {
  try {
    const user = getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users
router.post('/', (req, res) => {
  try {
    const body = req.body;

    if (!body.name || typeof body.name !== 'string') {
      return res.status(400).json({ error: 'name is required' });
    }

    const pos = randomSpherePoint(400);
    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];

    const newUser = {
      id: uuidv4(),
      name: stripHTML(body.name),
      avatar_color: body.avatar_color || randomColor,
      likes: sanitizeArray(body.likes),
      dislikes: sanitizeArray(body.dislikes),
      current_feeling: body.current_feeling ? stripHTML(body.current_feeling) : null,
      skills_offer: sanitizeArray(body.skills_offer),
      skills_need: sanitizeArray(body.skills_need),
      star_brightness: typeof body.star_brightness === 'number' ? body.star_brightness : 1.0,
      position_x: typeof body.position_x === 'number' ? body.position_x : pos.x,
      position_y: typeof body.position_y === 'number' ? body.position_y : pos.y,
      position_z: typeof body.position_z === 'number' ? body.position_z : pos.z,
      created_at: new Date().toISOString(),
      is_demo: false,
    };

    const created = createUser(newUser);

    // Compute and store connections with existing users
    const existingUsers = getAllUsers().filter(u => u.id !== newUser.id);
    const newConnections = computeConnectionsForUser(newUser, existingUsers);

    for (const conn of newConnections) {
      createConnection(conn);
    }

    res.status(201).json({
      user: created,
      connections_created: newConnections.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
