const fs = require('fs');
const path = require('path');

const dbPath = process.env.DATABASE_PATH || path.join(__dirname, '..', '..', 'irondesk_db.json');
const backupDir = path.join(__dirname, '..', '..', 'backups');

function backupDatabase() {
  if (!fs.existsSync(dbPath)) {
    console.log('[Backup] Database file does not exist yet. Skipping backup.');
    return;
  }

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `irondesk_db_backup_${timestamp}.json`);
    
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[Backup] Daily database backup created: ${backupPath}`);
    
    // Keep only the last 7 backups to prevent disk space exhaustion
    const files = fs.readdirSync(backupDir)
      .filter(f => f.startsWith('irondesk_db_backup_'))
      .map(f => ({ name: f, time: fs.statSync(path.join(backupDir, f)).mtime.getTime() }))
      .sort((a, b) => b.time - a.time);

    if (files.length > 7) {
      files.slice(7).forEach(file => {
        fs.unlinkSync(path.join(backupDir, file.name));
      });
      console.log(`[Backup] Pruned older backups. Retained the last 7 items.`);
    }
  } catch (err) {
    console.error('[Backup] Database backup execution failed:', err);
  }
}

function initBackupScheduler() {
  // Execute a backup immediately on startup
  backupDatabase();
  
  // Set recurrence interval for 24 hours
  setInterval(backupDatabase, 24 * 60 * 60 * 1000);
}

module.exports = {
  initBackupScheduler,
  backupDatabase
};
