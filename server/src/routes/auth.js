const express = require('express');
const router = express.Router();
const db = require('../db');
const { hashPassword, verifyPassword, generateToken } = require('../utils/auth');
const authMiddleware = require('../middleware/auth');

// GET /api/auth/check-setup - Check if setup is needed
router.get('/check-setup', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT COUNT(*) as count FROM admin');
    const count = parseInt(rows[0]?.count || '0', 10);
    res.json({ setupRequired: count === 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database check failed' });
  }
});

// POST /api/auth/setup - First-run setup (creates the very first admin)
router.post('/setup', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const { rows: checkRows } = await db.query('SELECT COUNT(*) as count FROM admin');
    const count = parseInt(checkRows[0]?.count || '0', 10);
    if (count > 0) {
      return res.status(400).json({ error: 'Setup already completed. Log in to add more admin accounts.' });
    }

    const hashedPassword = hashPassword(password);
    const { rows } = await db.query(
      'INSERT INTO admin (username, password_hash) VALUES ($1, $2) RETURNING *',
      [username.trim(), hashedPassword]
    );

    const admin = rows[0];
    const user = { id: admin.id, username: admin.username, role: 'admin' };
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

router.post('/login', async (req, res) => {
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

    const { rows } = await db.query('SELECT * FROM admin WHERE username = $1', [username.trim()]);
    const admin = rows[0];

    if (!admin || !verifyPassword(password, admin.password_hash)) {
      failedAttempts++;
      if (failedAttempts >= 5) {
        lockoutUntil = Date.now() + 60 * 1000;
        failedAttempts = 0;
        return res.status(429).json({ error: 'Too many login attempts. Locked out for 1 minute.' });
      }
      return res.status(401).json({ error: 'Invalid username or password' });
    }

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

// POST /api/auth/change-password - Update own password
router.post('/change-password', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password are required' });
    }

    const { rows } = await db.query('SELECT * FROM admin WHERE id = $1', [req.user.id]);
    const admin = rows[0];

    if (!admin || !verifyPassword(oldPassword, admin.password_hash)) {
      return res.status(401).json({ error: 'Incorrect old password' });
    }

    const newHashed = hashPassword(newPassword);
    await db.query('UPDATE admin SET password_hash = $1 WHERE id = $2', [newHashed, req.user.id]);

    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update password' });
  }
});

// ─── Admin User Management ────────────────────────────────────────────────────

// GET /api/auth/admins - List all admin accounts (requires auth)
router.get('/admins', authMiddleware, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT id, username FROM admin ORDER BY id ASC');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch admin list' });
  }
});

// POST /api/auth/admins - Create a new admin account (requires auth)
router.post('/admins', authMiddleware, async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const { rows: existing } = await db.query(
      'SELECT id FROM admin WHERE username = $1', [username.trim()]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: 'Username already exists. Choose a different one.' });
    }

    const hashedPassword = hashPassword(password);
    const { rows } = await db.query(
      'INSERT INTO admin (username, password_hash) VALUES ($1, $2) RETURNING id, username',
      [username.trim(), hashedPassword]
    );

    res.status(201).json({ success: true, admin: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

// DELETE /api/auth/admins/:id - Remove an admin account (cannot delete self or last account)
router.delete('/admins/:id', authMiddleware, async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);

    if (targetId === req.user.id) {
      return res.status(400).json({ error: 'You cannot delete your own account.' });
    }

    const { rows: countRows } = await db.query('SELECT COUNT(*) as count FROM admin');
    if (parseInt(countRows[0].count, 10) <= 1) {
      return res.status(400).json({ error: 'Cannot delete the last admin account.' });
    }

    const result = await db.query('DELETE FROM admin WHERE id = $1', [targetId]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Admin account not found.' });
    }

    res.json({ success: true, message: 'Admin account removed.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete admin account' });
  }
});

module.exports = router;
