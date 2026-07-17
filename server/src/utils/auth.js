const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'irondesk-super-secret-key-2026';
const ITERATIONS = 10000;
const KEY_LEN = 64;
const DIGEST = 'sha512';
const SALT = process.env.PASSWORD_SALT || process.env.PIN_SALT || 'irondesk-salt-key';

function hashPassword(password) {
  if (!password) throw new Error('Password is required for hashing');
  const hash = crypto.pbkdf2Sync(password, SALT, ITERATIONS, KEY_LEN, DIGEST);
  return hash.toString('hex');
}

function verifyPassword(password, hashedPassword) {
  try {
    const hash = hashPassword(password);
    return hash === hashedPassword;
  } catch (err) {
    return false;
  }
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, role: 'admin' },
    JWT_SECRET,
    { expiresIn: '30d' } // 30-day session for front desk ease-of-use
  );
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

module.exports = {
  hashPassword,
  verifyPassword,
  generateToken,
  verifyToken
};
