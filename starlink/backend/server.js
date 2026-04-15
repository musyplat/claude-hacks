import express from 'express';
import cors from 'cors';
import * as dbModule from './db.js';
import * as matching from './matching.js';
import { seedDatabase } from './seed.js';
import { generateConnectionCard } from './ai-cards.js';

import usersRouter from './routes/users.js';
import connectionsRouter from './routes/connections.js';
import exchangesRouter from './routes/exchanges.js';
import statsRouter from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://127.0.0.1:5173'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '1mb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routers
app.use('/api/users', usersRouter);
app.use('/api/connections', connectionsRouter);
app.use('/api/exchanges', exchangesRouter);
app.use('/api/stats', statsRouter);

// POST /api/seed — seed the database with demo data
app.post('/api/seed', async (req, res) => {
  try {
    const result = await seedDatabase(dbModule, matching);
    res.json({
      message: 'Database seeded successfully',
      ...result,
    });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/ai/connection-card — generate card for a pair of users
app.post('/api/ai/connection-card', (req, res) => {
  try {
    const { user_a_id, user_b_id } = req.body;

    if (!user_a_id || !user_b_id) {
      return res.status(400).json({ error: 'user_a_id and user_b_id are required' });
    }

    const userA = dbModule.getUserById(user_a_id);
    if (!userA) return res.status(404).json({ error: 'User A not found' });

    const userB = dbModule.getUserById(user_b_id);
    if (!userB) return res.status(404).json({ error: 'User B not found' });

    let connection = dbModule.getConnectionBetween(user_a_id, user_b_id);

    if (!connection) {
      // Compute on-the-fly without persisting
      const computed = matching.computeConnection(userA, userB);
      if (!computed) {
        return res.status(404).json({
          error: 'No meaningful connection exists between these users (score < 2)',
        });
      }
      connection = computed;
    }

    const card = generateConnectionCard(userA, userB, connection);

    res.json({
      user_a: userA,
      user_b: userB,
      connection,
      card,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error', details: err.message });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// Start server
app.listen(PORT, () => {
  console.log(`StarLink backend running on http://localhost:${PORT}`);
  console.log(`  POST /api/seed          — seed demo data`);
  console.log(`  GET  /api/users         — list all users`);
  console.log(`  GET  /api/connections   — list all connections`);
  console.log(`  GET  /api/stats         — campus pulse stats`);
  console.log(`  POST /api/ai/connection-card — generate connection card`);
});

export default app;
