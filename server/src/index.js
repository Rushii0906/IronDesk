require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS with restricted origin policy
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:5000',
      'http://localhost:5001'
    ];
    
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('capacitor://') || origin.startsWith('http://localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// Body parser middleware
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Import route modules
const plansRouter = require('./routes/plans');
const authRouter = require('./routes/auth');
const dashboardRouter = require('./routes/dashboard');
const membersRouter = require('./routes/members');
const remindersRouter = require('./routes/reminders');
const duesRouter = require('./routes/dues');

// Mount routes
app.use('/api/plans', plansRouter);
app.use('/api/auth', authRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/members', membersRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/dues', duesRouter);

// Basic health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve native app installers statically
app.use('/downloads', express.static(path.join(__dirname, '..', '..', 'downloads')));

// Serve frontend static assets in production
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, '..', '..', 'client', 'dist');
  app.use(express.static(clientBuildPath));
  
  // Catch-all route to serve index.html for React SPA
  app.get('*', (req, res) => {
    if (req.originalUrl.startsWith('/api')) {
      return res.status(404).json({ error: 'Not Found' });
    }
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start listening
const { initBackupScheduler } = require('./utils/backup');
app.listen(PORT, () => {
  console.log(`IronDesk Server running on port ${PORT}`);
  initBackupScheduler();
});
