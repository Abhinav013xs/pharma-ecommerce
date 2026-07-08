import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Resolve directory path safely for both ES Modules (local dev) and CommonJS (Netlify bundle)
let projectDirname = '';
try {
  if (typeof import.meta !== 'undefined' && import.meta.url) {
    const __filename = fileURLToPath(import.meta.url);
    projectDirname = path.dirname(__filename);
  } else {
    // @ts-ignore
    projectDirname = typeof __dirname !== 'undefined' ? __dirname : process.cwd();
  }
} catch (e) {
  projectDirname = process.cwd();
}

// Import Routers
import authRouter from './routes/auth.js';
import productsRouter from './routes/products.js';
import prescriptionsRouter from './routes/prescriptions.js';
import ordersRouter from './routes/orders.js';
import addressesRouter from './routes/addresses.js';
import remindersRouter from './routes/reminders.js';
import supportRouter from './routes/support.js';
import adminRouter from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:3001' // local alternatives
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy'));
    }
  },
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve local upload uploads directory statically (pointing to /tmp/uploads in serverless mode)
const uploadsStaticPath = process.env.NETLIFY ? '/tmp/uploads' : path.join(projectDirname, '../uploads');
app.use('/uploads', express.static(uploadsStaticPath));

// Mount API routers
app.use('/api/auth', authRouter);
app.use('/api/products', productsRouter);
app.use('/api/prescriptions', prescriptionsRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/addresses', addressesRouter);
app.use('/api/reminders', remindersRouter);
app.use('/api/support', supportRouter);
app.use('/api/admin', adminRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    timestamp: new Date(),
    service: 'Medicloud Pharma Platform E-Commerce API Server'
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Express Backend Error:", err.stack || err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal server error occurred."
  });
});

// Start the server (only if not running inside a serverless handler)
if (process.env.NODE_ENV !== 'production' || !process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`🚀 Medicloud Pharma API Server running on port ${PORT}`);
    console.log(`🔗 Local endpoint health check: http://localhost:${PORT}/health`);
  });
}

export default app;
