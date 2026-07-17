const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'irondesk-super-secret-key-2026';
const ITERATIONS = 10000;
const KEY_LEN = 64;
const DIGEST = 'sha512';
const SALT = process.env.PIN_SALT || 'irondesk-salt-key';

function hashPin(pin) {
  if (!pin) throw new Error('PIN is required for hashing');
  const hash = crypto.pbkdf2Sync(pin, SALT, ITERATIONS, KEY_LEN, DIGEST);
  return hash.toString('hex');
}

function verifyPin(pin, hashedPin) {
  try {
    const hash = hashPin(pin);
    return hash === hashedPin;
  } catch (err) {
    return false;
  }
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, name: user.name, role: user.role },
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
  hashPin,
  verifyPin,
  generateToken,
  verifyToken
};
