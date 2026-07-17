const express = require('express');
const router = express.Router();
const db = require('../db');
const authMiddleware = require('../middleware/auth');
const { sanitizeHtml, sanitizePhone } = require('../utils/sanitize');

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

// GET /api/members - Fetch and filter members list
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { search, status } = req.query;
    const todayStr = getLocalDateString();

    const { rows: members } = await db.query('SELECT * FROM members');
    const { rows: plans } = await db.query('SELECT * FROM plans');

    // Map plans to an object for fast lookup
    const plansMap = {};
    plans.forEach(p => { plansMap[p.id] = p; });

    let results = members.map(m => {
      const plan = plansMap[m.plan_id] || null;
      const daysLeft = getDaysDifference(m.due_date, todayStr);
      let computedStatus = 'active';

      if (daysLeft < 0) {
        computedStatus = 'expired';
      } else if (daysLeft <= 7) {
        computedStatus = 'expiring';
      }

      return {
        ...m,
        plan_name: plan ? plan.name : 'No Plan',
        plan_duration_months: plan ? plan.duration_months : 0,
        plan_price: plan ? plan.price : 0,
        days_left: daysLeft,
        status: computedStatus
      };
    });

    // Apply Search Filter (name or phone)
    if (search) {
      const q = search.toLowerCase();
      results = results.filter(m => 
        (m.name && m.name.toLowerCase().includes(q)) || 
        (m.phone && m.phone.toLowerCase().includes(q))
      );
    }

    // Apply Status Filter
    if (status && status !== 'all') {
      results = results.filter(m => m.status === status);
    }

    // Sort by name alphabetically
    results.sort((a, b) => (a.name || '').localeCompare(b.name || ''));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Fetch single member profile details
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows: members } = await db.query('SELECT * FROM members WHERE id = $1', [id]);
    const member = members[0];

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    let plan = null;
    if (member.plan_id) {
      const { rows: plans } = await db.query('SELECT * FROM plans WHERE id = $1', [member.plan_id]);
      plan = plans[0] || null;
    }

    const { rows: payments } = await db.query('SELECT * FROM payments WHERE member_id = $1 ORDER BY date DESC', [id]);

    // Compute current status
    const todayStr = getLocalDateString();
    const daysLeft = getDaysDifference(member.due_date, todayStr);
    let computedStatus = 'active';
    if (daysLeft < 0) {
      computedStatus = 'expired';
    } else if (daysLeft <= 7) {
      computedStatus = 'expiring';
    }

    res.json({
      success: true,
      member: {
        ...member,
        status: computedStatus,
        days_left: daysLeft,
        plan_name: plan ? plan.name : 'No Plan'
      },
      plan,
      payments
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch member details' });
  }
});

// POST /api/members - Create a new member (calculates due_date automatically)
router.post('/', authMiddleware, async (req, res) => {
  try {
    let { name, phone, plan_id, join_date } = req.body;
    name = sanitizeHtml(name);
    phone = sanitizePhone(phone);

    if (!name || !phone || !plan_id || !join_date) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, plan_id, join_date' });
    }

    // Fetch the plan to know duration
    const { rows: plans } = await db.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    const plan = plans[0];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Calculate due_date = join_date + plan.duration_months
    const join = new Date(join_date + 'T00:00:00');
    join.setMonth(join.getMonth() + plan.duration_months);
    const due_date = `${join.getFullYear()}-${String(join.getMonth() + 1).padStart(2, '0')}-${String(join.getDate()).padStart(2, '0')}`;

    const { rows } = await db.query(
      'INSERT INTO members (name, phone, plan_id, join_date, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, phone, plan_id, join_date, due_date]
    );

    res.status(201).json({ success: true, member: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT /api/members/:id - Update member details
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let { name, phone, plan_id, due_date } = req.body;
    name = sanitizeHtml(name);
    phone = sanitizePhone(phone);
    
    if (!name || !phone || !plan_id || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const { rows } = await db.query(
      'UPDATE members SET name = $1, phone = $2, plan_id = $3, due_date = $4 WHERE id = $5 RETURNING *',
      [name, phone, plan_id, due_date, id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, member: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Delete member (Postgres handles cascades)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await db.query('DELETE FROM members WHERE id = $1 RETURNING *', [id]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// POST /api/members/:id/renew - Log payment and renew member membership
router.post('/:id/renew', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    let { plan_id, amount, method } = req.body;

    if (!plan_id || amount === undefined || !method) {
      return res.status(400).json({ error: 'Missing required fields: plan_id, amount, method' });
    }

    method = sanitizeHtml(method).toLowerCase();
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return res.status(400).json({ error: 'Payment amount must be a positive number' });
    }

    if (!['cash', 'card', 'upi'].includes(method)) {
      return res.status(400).json({ error: 'Invalid payment method' });
    }

    const { rows: plans } = await db.query('SELECT * FROM plans WHERE id = $1', [plan_id]);
    const plan = plans[0];
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const { rows: members } = await db.query('SELECT * FROM members WHERE id = $1', [id]);
    const member = members[0];
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const todayStr = getLocalDateString();
    
    // Base date selection logic: future due date vs today
    let baseDate;
    if (member.due_date > todayStr) {
      baseDate = new Date(member.due_date + 'T00:00:00');
    } else {
      baseDate = new Date(todayStr + 'T00:00:00');
    }

    // Add plan duration in months
    baseDate.setMonth(baseDate.getMonth() + plan.duration_months);
    const newDueDate = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}-${String(baseDate.getDate()).padStart(2, '0')}`;

    // Update member's due date and plan
    const { rows: updatedMembers } = await db.query(
      'UPDATE members SET plan_id = $1, due_date = $2 WHERE id = $3 RETURNING *',
      [plan_id, newDueDate, id]
    );

    // Record payment
    const paymentDate = todayStr;
    const { rows: paymentInfo } = await db.query(
      'INSERT INTO payments (member_id, plan_id, amount, date, method) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [id, plan_id, parsedAmount, paymentDate, method]
    );

    res.json({
      success: true,
      member: updatedMembers[0],
      payment: paymentInfo[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
});

module.exports = router;
