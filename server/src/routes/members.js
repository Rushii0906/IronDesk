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

    const { data: members, error: mErr } = await db.from('members').select('*');
    if (mErr) throw mErr;

    const { data: plans, error: pErr } = await db.from('plans').select('*');
    if (pErr) throw pErr;

    // Map plans to an object for fast lookup
    const plansMap = {};
    plans.forEach(p => { plansMap[p.id] = p; });

    let results = (members || []).map(m => {
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
    const { data: member, error: mErr } = await db.from('members').select('*').eq('id', id).maybeSingle();
    if (mErr) throw mErr;

    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    const { data: plan } = member.plan_id 
      ? await db.from('plans').select('*').eq('id', member.plan_id).maybeSingle()
      : { data: null };

    const { data: payments } = await db.from('payments')
      .select('*')
      .eq('member_id', id)
      .order('date', { ascending: false });

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
      payments: payments || []
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
    const { data: plan, error: pErr } = await db.from('plans').select('*').eq('id', plan_id).maybeSingle();
    if (pErr) throw pErr;
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Calculate due_date = join_date + plan.duration_months
    const join = new Date(join_date + 'T00:00:00');
    join.setMonth(join.getMonth() + plan.duration_months);
    const due_date = `${join.getFullYear()}-${String(join.getMonth() + 1).padStart(2, '0')}-${String(join.getDate()).padStart(2, '0')}`;

    const { data: newMember, error: iErr } = await db.from('members')
      .insert([{ name, phone, plan_id, join_date, due_date }])
      .select();

    if (iErr) throw iErr;

    res.status(201).json({ success: true, member: newMember[0] });
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

    const { data: updatedMember, error: uErr } = await db.from('members')
      .update({ name, phone, plan_id, due_date })
      .eq('id', id)
      .select();

    if (uErr) throw uErr;

    if (!updatedMember || updatedMember.length === 0) {
      return res.status(404).json({ error: 'Member not found' });
    }

    res.json({ success: true, member: updatedMember[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update member' });
  }
});

// DELETE /api/members/:id - Delete member (Postgres handles payment cascades)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await db.from('members')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (!data || data.length === 0) {
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
      return res.status(400).json({ error: 'Invalid payment method. Allowed: cash, card, upi' });
    }

    const { data: plan, error: pErr } = await db.from('plans').select('*').eq('id', plan_id).maybeSingle();
    if (pErr) throw pErr;
    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const { data: member, error: mErr } = await db.from('members').select('*').eq('id', id).maybeSingle();
    if (mErr) throw mErr;
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
    const { error: uErr } = await db.from('members')
      .update({ plan_id, due_date: newDueDate })
      .eq('id', id);
    if (uErr) throw uErr;

    // Record payment
    const paymentDate = todayStr;
    const { data: paymentInfo, error: payErr } = await db.from('payments')
      .insert([{ member_id: id, plan_id, amount: parsedAmount, date: paymentDate, method }])
      .select();

    if (payErr) throw payErr;

    const { data: updatedMember, error: fetchErr } = await db.from('members').select('*').eq('id', id).maybeSingle();
    if (fetchErr) throw fetchErr;

    res.json({
      success: true,
      member: updatedMember,
      payment: paymentInfo[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to renew membership' });
  }
});

module.exports = router;
