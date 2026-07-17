const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// GET /api/plans - Get all plans
router.get('/', (req, res) => {
  try {
    const plans = db.prepare('SELECT * FROM plans').all();
    res.json(plans);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }
});

// POST /api/plans - Create a new plan
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, duration_months, price } = req.body;
    if (!name || !duration_months || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields: name, duration_months, price' });
    }

    const info = db.prepare('INSERT INTO plans (name, duration_months, price) VALUES (?, ?, ?)')
      .run(name, duration_months, price);

    const newPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, plan: newPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create plan' });
  }
});

// PUT /api/plans/:id - Update an existing plan
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { name, duration_months, price } = req.body;
    if (!name || !duration_months || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare('UPDATE plans SET name = ?, duration_months = ?, price = ? WHERE id = ?')
      .run(name, duration_months, price, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    const updatedPlan = db.prepare('SELECT * FROM plans WHERE id = ?').get(id);
    res.json({ success: true, plan: updatedPlan });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update plan' });
  }
});

// DELETE /api/plans/:id - Delete a plan
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM plans WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Plan not found' });
    }

    res.json({ success: true, message: 'Plan deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete plan' });
  }
});

module.exports = router;
