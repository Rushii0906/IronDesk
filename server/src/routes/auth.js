const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');
const authMiddleware = require('../middleware/auth');

// GET /api/auth/check-setup - Check if setup is needed
router.get('/check-setup', (req, res) => {
  try {
    const row = db.prepare('SELECT COUNT(*) as count FROM admin').get();
    const count = row ? row.count : 0;
    res.json({ setupRequired: count === 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database check failed' });
  }
});

// POST /api/auth/setup - First-run setup (creates single admin ever)
router.post('/setup', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Enforce that only one admin record can ever exist
    const checkRow = db.prepare('SELECT COUNT(*) as count FROM admin').get();
    if (checkRow && checkRow.count > 0) {
      return res.status(400).json({ error: 'Setup has already been completed. Only one admin account is allowed.' });
    }

    const hashedPassword = hashPassword(password);
    const info = db.prepare('INSERT INTO admin (username, password_hash) VALUES (?, ?)')
      .run(username.trim(), hashedPassword);

    const user = { id: info.lastInsertRowid, username: username.trim(), role: 'admin' };
    const token = generateToken(user);

    res.status(201).json({ success: true, token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Setup failed' });
  }
});

// POST /api/auth/login - Admin login with brute-force protection
let failedAttempts = 0;
let lockoutUntil = null;

router.post('/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const now = Date.now();
    if (lockoutUntil && now < lockoutUntil) {
      const secondsLeft = Math.ceil((lockoutUntil - now) / 1000);
      return res.status(429).json({ error: `Too many login attempts. Locked out. Try again in ${secondsLeft} seconds.` });
    }

    const admin = db.prepare('SELECT * FROM admin WHERE username = ?').get(username.trim());
    if (!admin || !verifyPassword(password, admin.password_hash)) {
      failedAttempts++;
      if (failedAttempts >= 5) {
        lockoutUntil = Date.now() + 60 * 1000; // 1-minute lockout
        failedAttempts = 0;
        return res.status(429).json({ error: 'Too many login attempts. Locked out for 1 minute.' });
      }
      return res.status(401).json({ error: 'Invalid username or password' });
    }

    // Success - reset counters
    failedAttempts = 0;
    lockoutUntil = null;

    const user = { id: admin.id, username: admin.username, role: 'admin' };
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

// POST /api/auth/change-password - Update password
router.post('/change-password', authMiddleware, (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    // Verify current admin record
    const admin = db.prepare('SELECT * FROM admin WHERE id = ?').get(req.user.id);
    if (!admin || !verifyPassword(oldPassword, admin.password_hash)) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const newHashed = hashPassword(newPassword);
    db.prepare('UPDATE admin SET password_hash = ? WHERE id = ?').run(newHashed, req.user.id);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

module.exports = router;
