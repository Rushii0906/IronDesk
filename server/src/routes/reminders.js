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

// GET /api/reminders - List members expiring within N days
router.get('/', authMiddleware, async (req, res) => {
  try {
    const limitDays = parseInt(req.query.days, 10) || 7;
    const todayStr = getLocalDateString();
    
    const { rows: members } = await db.query('SELECT * FROM members');
    
    const results = [];
    members.forEach(member => {
      const daysLeft = getDaysDifference(member.due_date, todayStr);
      // Expiring soon: due in the future, within the threshold
      if (daysLeft >= 0 && daysLeft <= limitDays) {
        results.push({
          id: member.id,
          name: member.name,
          phone: member.phone,
          due_date: member.due_date,
          days_left: daysLeft
        });
      }
    });

    // Sort by days_left ascending (soonest to expire first)
    results.sort((a, b) => a.days_left - b.days_left);

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch expiry reminders' });
  }
});

module.exports = router;
