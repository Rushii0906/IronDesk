const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { sanitizeHtml } = require('../utils/sanitize');

// GET /api/plans - Get all plans
router.get('/', async (req, res) => {
  try {
    const { data, error } = await db.from('plans').select('*').order('name');
    if (error) throw error;
    res.json(data || []);
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

    const { data, error } = await db.from('plans')
      .insert([{ name, duration_months: duration, price: rate }])
      .select();

    if (error) throw error;
    res.status(201).json({ success: true, plan: data[0] });
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

    const { data, error } = await db.from('plans')
      .update({ name, duration_months: duration, price: rate })
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, plan: data[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// DELETE /api/plans/:id - Delete a plan
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await db.from('plans')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

module.exports = router;
