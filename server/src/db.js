const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', 'irondesk_db.json');

let data = {
  admin: [],
  plans: [],
  members: [],
  payments: []
};

// Load existing data
function load() {
  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
      // Ensure all arrays are initialized
      data.admin = data.admin || [];
      data.plans = data.plans || [];
      data.members = data.members || [];
      data.payments = data.payments || [];
    } catch (err) {
      console.error("Error reading JSON database, starting fresh", err);
    }
  } else {
    save();
  }
}

function save() {
  const dbDir = path.dirname(dbPath);
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
}

load();

// Emulates better-sqlite3 statement interface
class Statement {
  constructor(sql) {
    this.sql = sql.trim().replace(/\s+/g, ' ');
  }

  // Parses WHERE clause parameters and returns items matching the filters
  _filter(table, params) {
    let list = data[table] || [];
    
    // Locate the WHERE segment in the SQL query
    const whereMatch = this.sql.match(/WHERE\s+(.+?)(?:ORDER\s+BY|LIMIT|$)/i);
    if (!whereMatch) return [...list];

    const whereClause = whereMatch[1].trim();
    // Parse individual field comparisons separated by AND
    const conditions = whereClause.split(/\s+AND\s+/i);
    
    return list.filter(item => {
      let paramIdx = 0;
      for (const cond of conditions) {
        // e.g. "id = ?" or "pin = ?"
        const parts = cond.split('=');
        if (parts.length !== 2) continue;
        const field = parts[0].trim().replace(/^\w+\./, ''); // remove table prefix if any, e.g. m.plan_id -> plan_id
        const valueExpr = parts[1].trim();
        
        let targetValue;
        if (valueExpr === '?') {
          targetValue = params[paramIdx++];
        } else {
          targetValue = valueExpr.replace(/['"]/g, ''); // strip quotes
        }

        // Loose comparison since DB ids might be numbers and query parameters strings
        if (item[field] != targetValue) {
          return false;
        }
      }
      return true;
    });
  }

  all(...params) {
    const flatParams = params.flat();
    
    // Support SELECT COUNT(*) queries
    if (this.sql.match(/SELECT\s+COUNT\(\*\)\s+as\s+count\s+FROM\s+(\w+)/i)) {
      const table = this.sql.match(/FROM\s+(\w+)/i)[1].toLowerCase();
      const count = (data[table] || []).length;
      return [{ count }];
    }

    if (this.sql.match(/SELECT\s+COUNT\(\*\)\s+FROM\s+(\w+)/i)) {
      const table = this.sql.match(/FROM\s+(\w+)/i)[1].toLowerCase();
      const count = (data[table] || []).length;
      return [{ "COUNT(*)": count }];
    }

    // Standard SELECT
    const selectMatch = this.sql.match(/SELECT\s+(.+?)\s+FROM\s+(\w+)/i);
    if (!selectMatch) throw new Error(`Unsupported SQL query: ${this.sql}`);
    
    const table = selectMatch[2].toLowerCase();
    let results = this._filter(table, flatParams);

    // Support ORDER BY
    const orderMatch = this.sql.match(/ORDER\s+BY\s+(.+?)(?:LIMIT|$)/i);
    if (orderMatch) {
      const orderFields = orderMatch[1].split(',');
      results.sort((a, b) => {
        for (const orderField of orderFields) {
          const [field, dir] = orderField.trim().split(/\s+/);
          const isDesc = dir && dir.toUpperCase() === 'DESC';
          let valA = a[field];
          let valB = b[field];
          if (valA === undefined) valA = '';
          if (valB === undefined) valB = '';
          
          if (typeof valA === 'string' && typeof valB === 'string') {
            return isDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
          }
          if (valA < valB) return isDesc ? 1 : -1;
          if (valA > valB) return isDesc ? -1 : 1;
        }
        return 0;
      });
    }

    // Support LIMIT
    const limitMatch = this.sql.match(/LIMIT\s+(\d+)/i);
    if (limitMatch) {
      const limit = parseInt(limitMatch[1], 10);
      results = results.slice(0, limit);
    }

    return results;
  }

  get(...params) {
    const results = this.all(...params);
    return results[0] || null;
  }

  run(...params) {
    const flatParams = params.flat();

    // Check for INSERT
    const insertMatch = this.sql.match(/INSERT\s+INTO\s+(\w+)\s*\((.+?)\)\s*VALUES\s*\((.+?)\)/i);
    if (insertMatch) {
      const table = insertMatch[1].toLowerCase();
      const fields = insertMatch[2].split(',').map(f => f.trim());
      
      const newId = (data[table] && data[table].length > 0) 
        ? Math.max(...data[table].map(item => item.id)) + 1 
        : 1;

      const newItem = { id: newId };
      fields.forEach((field, idx) => {
        newItem[field] = flatParams[idx];
      });
      
      newItem.created_at = new Date().toISOString().replace('T', ' ').substring(0, 19);

      if (!data[table]) data[table] = [];
      data[table].push(newItem);
      save();

      return { lastInsertRowid: newId, changes: 1 };
    }

    // Check for UPDATE
    const updateMatch = this.sql.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE|$)/i);
    if (updateMatch) {
      const table = updateMatch[1].toLowerCase();
      const setClause = updateMatch[2];
      
      // Parse fields to update
      const setPairs = setClause.split(',');
      const updateFields = [];
      setPairs.forEach(pair => {
        const parts = pair.split('=');
        updateFields.push(parts[0].trim());
      });

      const valCount = updateFields.length;
      const updateVals = flatParams.slice(0, valCount);
      const whereVals = flatParams.slice(valCount);

      const itemsToUpdate = this._filter(table, whereVals);
      
      itemsToUpdate.forEach(item => {
        updateFields.forEach((field, idx) => {
          item[field] = updateVals[idx];
        });
      });

      if (itemsToUpdate.length > 0) {
        save();
      }

      return { changes: itemsToUpdate.length };
    }

    // Check for DELETE
    const deleteMatch = this.sql.match(/DELETE\s+FROM\s+(\w+)/i);
    if (deleteMatch) {
      const table = deleteMatch[1].toLowerCase();
      const itemsToDelete = this._filter(table, flatParams);
      const idsToDelete = new Set(itemsToDelete.map(item => item.id));

      if (idsToDelete.size > 0) {
        data[table] = data[table].filter(item => !idsToDelete.has(item.id));
        
        // Handle cascade deletes programmatically
        if (table === 'members') {
          data.payments = data.payments.filter(p => !idsToDelete.has(p.member_id));
        } else if (table === 'plans') {
          // If a plan is deleted, set plan_id to null for members using it
          if (data.members) {
            data.members.forEach(m => {
              if (idsToDelete.has(m.plan_id)) {
                m.plan_id = null;
              }
            });
          }
        }
        save();
      }

      return { changes: idsToDelete.size };
    }

    throw new Error(`Unsupported SQL execution: ${this.sql}`);
  }
}

const db = {
  prepare: (sql) => new Statement(sql),
  pragma: (sql) => console.log(`PRAGMA executed: ${sql}`),
  _clear: () => {
    data = { admin: [], plans: [], members: [], payments: [] };
    save();
  }
};

module.exports = db;
