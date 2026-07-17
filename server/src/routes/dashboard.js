const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');

// Utility to get local YYYY-MM-DD date string
function getLocalDateString() {
  const localDate = new Date();
  const offset = localDate.getTimezoneOffset();
  const offsetDate = new Date(localDate.getTime() - (offset * 60 * 1000));
  return offsetDate.toISOString().split('T')[0];
}

// Utility to calculate difference in calendar days (date2 - date1)
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

// GET /api/dashboard - Get operational statistics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const todayStr = getLocalDateString();
    const currentMonthPrefix = todayStr.substring(0, 7); // e.g. "2026-07"

    // Fetch all members
    const { rows: members } = await db.query('SELECT * FROM members');
    
    // Fetch all payments
    const { rows: payments } = await db.query('SELECT * FROM payments');

    const currentMonthPayments = payments.filter(p => p.date && p.date.startsWith(currentMonthPrefix));
    const monthlyRevenue = currentMonthPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

    let activeCount = 0;
    let expiringCount = 0;
    let expiredCount = 0;
    const attentionList = [];

    members.forEach(member => {
      const daysLeft = getDaysDifference(member.due_date, todayStr);
      let status = 'active';

      if (daysLeft < 0) {
        status = 'expired';
        expiredCount++;
      } else if (daysLeft <= 7) {
        status = 'expiring';
        expiringCount++;
      } else {
        activeCount++;
      }

      // Add to attention list if expired or expiring soon
      if (status === 'expired' || status === 'expiring') {
        attentionList.push({
          id: member.id,
          name: member.name,
          phone: member.phone,
          due_date: member.due_date,
          days_left: daysLeft,
          status: status
        });
      }
    });

    // Sort attention list by urgency
    attentionList.sort((a, b) => a.days_left - b.days_left);

    res.json({
      activeCount,
      expiringCount,
      expiredCount,
      totalCount: members.length,
      monthlyRevenue,
      attentionList
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate dashboard statistics' });
  }
});

module.exports = router;
