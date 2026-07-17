const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { sanitizeHtml } = require('../utils/sanitize');

// GET /api/plans - Get all plans
router.get('/', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM plans ORDER BY name');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// POST /api/plans - Create a new plan
router.post('/', authMiddleware, async (req, res) => {
  try {
    let { name, duration_months, price } = req.body;
    name = sanitizeHtml(name);

    if (!name || !duration_months || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, duration_months, price' });
    }

    const duration = parseInt(duration_months, 10);
    const rate = parseFloat(price);
    if (isNaN(duration) || duration <= 0 || isNaN(rate) || rate < 0) {
      return res.status(400).json({ error: 'Duration and Price must be positive values' });
    }

    const { rows } = await db.query(
      'INSERT INTO plans (name, duration_months, price) VALUES ($1, $2, $3) RETURNING *',
      [name, duration, rate]
    );

    res.status(201).json({ success: true, plan: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// PUT /api/plans/:id - Update an existing plan
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let { name, duration_months, price } = req.body;
    name = sanitizeHtml(name);

    if (!name || !duration_months || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const duration = parseInt(duration_months, 10);
    const rate = parseFloat(price);
    if (isNaN(duration) || duration <= 0 || isNaN(rate) || rate < 0) {
      return res.status(400).json({ error: 'Duration and Price must be positive values' });
    }

    const { rows } = await db.query(
      'UPDATE plans SET name = $1, duration_months = $2, price = $3 WHERE id = $4 RETURNING *',
      [name, duration, rate, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, plan: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// DELETE /api/plans/:id - Delete a plan
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('DELETE FROM plans WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

module.exports = router;
