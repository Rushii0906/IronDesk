const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

function getLocalDateString() {
  const localDate = new Date();
  const offset = localDate.getTimezoneOffset();
  const offsetDate = new Date(localDate.getTime() - (offset * 60 * 1000));
  return offsetDate.toISOString().split('T')[0];
}

function getDaysDifference(dueDateStr, todayStr) {
  try {
    const due = new Date(dueDateStr + 'T00:00:00');
    const today = new Date(todayStr + 'T00:00:00');
    const diffTime = due - today;
    return Math.round(diffTime / (1000 * 60 * 60 * 24));
  } catch (err) {
    return 0;
  }
}

// GET /api/dues - List expired members
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todayStr = getLocalDateString();
    
    const { data: members, error } = await db.from('members').select('*');
    if (error) throw error;
    
    const results = [];
    (members || []).forEach(member => {
      const daysLeft = getDaysDifference(member.due_date, todayStr);
      // Expired: due date is in the past
      if (daysLeft < 0) {
        results.push({
          id: member.id,
          name: member.name,
          phone: member.phone,
          due_date: member.due_date,
          days_overdue: Math.abs(daysLeft)
        });
      }
    });

    // Sort by days_overdue descending (most overdue first)
    results.sort((a, b) => b.days_overdue - a.days_overdue);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch dues tracking' });
  }
});

module.exports = router;
