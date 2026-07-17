/**
 * Security Sanitization Utilities
 */

/**
 * Strips all HTML tags from a string to prevent Stored XSS injections.
 */
function sanitizeHtml(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/<[^>]*>/g, '').trim();
}

/**
 * Normalizes a phone number to retain only digits.
 */
function sanitizePhone(phone) {
  if (typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '').trim();
}

module.exports = {
  sanitizeHtml,
  sanitizePhone
};
