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
router.get('/', authMiddleware, (req, res) => {
  try {
    const { search, status } = req.query;
    const todayStr = getLocalDateString();

    const members = db.prepare('SELECT * FROM members').all();
    const plans = db.prepare('SELECT * FROM plans').all();

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
    results.sort((a, b) => a.name.localeCompare(b.name));

    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch members' });
  }
});

// GET /api/members/:id - Fetch single member profile details
router.get('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const plan = member.plan_id ? db.prepare('SELECT * FROM plans WHERE id = ?').get(member.plan_id) : null;
    const payments = db.prepare('SELECT * FROM payments WHERE member_id = ? ORDER BY date DESC').all(id);

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
router.post('/', authMiddleware, (req, res) => {
  try {
    let { name, phone, plan_id, join_date } = req.body;
    name = sanitizeHtml(name);
    phone = sanitizePhone(phone);

    if (!name || !phone || !plan_id || !join_date) {
      return res.status(400).json({ error: 'Missing required fields: name, phone, plan_id, join_date' });
    }

    // Fetch the plan to know duration
    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Calculate due_date = join_date + plan.duration_months
    const join = new Date(join_date + 'T00:00:00');
    join.setMonth(join.getMonth() + plan.duration_months);
    const due_date = `${join.getFullYear()}-${String(join.getMonth() + 1).padStart(2, '0')}-${String(join.getDate()).padStart(2, '0')}`;

    const info = db.prepare('INSERT INTO members (name, phone, plan_id, join_date, due_date) VALUES (?, ?, ?, ?, ?)')
      .run(name, phone, plan_id, join_date, due_date);

    const newMember = db.prepare('SELECT * FROM members WHERE id = ?').get(info.lastInsertRowid);
    res.status(201).json({ success: true, member: newMember });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create member' });
  }
});

// PUT /api/members/:id - Update member details
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    let { name, phone, plan_id, due_date } = req.body;
    name = sanitizeHtml(name);
    phone = sanitizePhone(phone);
    
    if (!name || !phone || !plan_id || !due_date) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = db.prepare('UPDATE members SET name = ?, phone = ?, plan_id = ?, due_date = ? WHERE id = ?')
      .run(name, phone, plan_id, due_date, id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const updatedMember = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    res.json({ success: true, member: updatedMember });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Delete member and cascade payments
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const result = db.prepare('DELETE FROM members WHERE id = ?').run(id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, message: 'Member deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete member' });
  }
});

// POST /api/members/:id/renew - Log payment and renew member membership
router.post('/:id/renew', authMiddleware, (req, res) => {
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
      return res.status(400).json({ error: 'Invalid payment method. Allowed: cash, card, upi' });
    }

    const plan = db.prepare('SELECT * FROM plans WHERE id = ?').get(plan_id);
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const member = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
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
    db.prepare('UPDATE members SET plan_id = ?, due_date = ? WHERE id = ?')
      .run(plan_id, newDueDate, id);

    // Record payment
    const paymentDate = todayStr;
    const paymentInfo = db.prepare('INSERT INTO payments (member_id, plan_id, amount, date, method) VALUES (?, ?, ?, ?, ?)')
      .run(id, plan_id, amount, paymentDate, method);

    const updatedMember = db.prepare('SELECT * FROM members WHERE id = ?').get(id);
    const newPayment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentInfo.lastInsertRowid);

    res.json({
      success: true,
      member: updatedMember,
      payment: newPayment
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
});

module.exports = router;
