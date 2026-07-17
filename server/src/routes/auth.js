const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPin, verifyPin, generateToken } = require('../utils/auth');
const authMiddleware = require('../middleware/auth');

// GET /api/auth/check-setup - Check if setup is needed
router.get('/check-setup', (req, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM staff').get();
    const count = row ? row.count : 0;
    res.json({ setupRequired: count === 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database check failed' });
  }
});

// POST /api/auth/setup - First-run setup
router.post('/setup', (req, res) => {
  try {
    const { name, pin } = req.body;
    if (!name || !pin) {
      return res.status(400).json({ error: 'Name and PIN are required' });
    }

    // Check if staff already exists
    const checkRow = db.prepare('SELECT COUNT(*) as count FROM staff').get();
    if (checkRow && checkRow.count > 0) {
      return res.status(400).json({ error: 'Setup has already been completed' });
    }

    const hashedPin = hashPin(pin);
    const info = db.prepare("INSERT INTO staff (name, pin, role) VALUES (?, ?, 'admin')")
      .run(name, hashedPin);

    const user = { id: info.lastInsertRowid, name, role: 'admin' };
    const token = generateToken(user);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// POST /api/auth/login - Staff login
router.post('/login', (req, res) => {
  try {
    const { pin } = req.body;
    if (!pin) {
      return res.status(400).json({ error: 'PIN is required' });
    }

    const hashedPin = hashPin(pin);
    const staff = db.prepare('SELECT * FROM staff WHERE pin = ?').get(hashedPin);

    if (!staff) {
      return res.status(401).json({ error: 'Invalid PIN' });
    }

    const user = { id: staff.id, name: staff.name, role: staff.role };
    const token = generateToken(user);

    res.json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me - Get current session
router.get('/me', authMiddleware, (req, res) => {
  res.json({ success: true, user: req.user });
});

// POST /api/auth/change-pin - Update PIN
router.post('/change-pin', authMiddleware, (req, res) => {
  try {
    const { oldPin, newPin } = req.body;
    if (!oldPin || !newPin) {
      return res.status(400).json({ error: 'Old PIN and New PIN are required' });
    }

    // Verify current user's record
    const staff = db.prepare('SELECT * FROM staff WHERE id = ?').get(req.user.id);
    if (!staff || !verifyPin(oldPin, staff.pin)) {
      return res.status(401).json({ error: 'Incorrect old PIN' });
    }

    const newHashedPin = hashPin(newPin);
    db.prepare('UPDATE staff SET pin = ? WHERE id = ?').run(newHashedPin, req.user.id);

    res.json({ success: true, message: 'PIN updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update PIN' });
  }
});

module.exports = router;
