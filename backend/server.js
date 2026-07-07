import './config/loadEnv.js';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';

import { fileURLToPath } from 'url';

// DB Config
import connectDB from './config/db.js';

// Middlewares
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
// Routes
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import changeRequestRoutes from './routes/changeRequestRoutes.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import { scheduleActivityCleanup } from './services/activityCleanupJob.js';
import platformRoutes from './routes/platformRoutes.js';
import globalRateRoutes from './routes/globalRateRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import cashLedgerRoutes from './routes/cashLedgerRoutes.js';
import userBalanceRoutes from './routes/userBalanceRoutes.js';
import reportsRoutes from './routes/reportsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

// Worker initialization
import { startStatsWorker } from './workers/statsWorker.js';
import { startUserWorker } from './workers/userWorker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { isEmailConfigured, verifyEmailConnection } from './services/emailService.js';

const app = express();

// 1. Connect Database (Initial check + Serverless Middleware)
connectDB().catch(err => console.error("Initial MongoDB connection failed:", err.message));

app.use(async (req, res, next) => {
    try {
        await connectDB();
        next();
    } catch (err) {
        next(err);
    }
});


app.use((req, res, next) => {
    console.log(`[HTTP] ${req.method} ${req.url}`);
    next();
});

// Starting Cron Jobs and Event Workers
scheduleActivityCleanup();
startStatsWorker();
startUserWorker();

// 2. Global Middlewares
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
})); // Security headers with cross-origin image support

app.use(cors({
    origin: [process.env.CORS_ORIGIN || 'http://localhost:5173', 'http://localhost:5174'], // Vite default dev ports
    credentials: true, // Allow cookies to be sent cross-origin
}));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static Asset Deployment (Logos/Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// 3. Rate Limiting (Basic Protection)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300, // Limit each IP to 100 requests per window
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api', limiter);

// 4. API Routes
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/audit-logs', auditLogRoutes);
app.use('/api/change-requests', changeRequestRoutes);
app.use('/api/platforms', platformRoutes);
app.use('/api/rates', globalRateRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ledger', cashLedgerRoutes);
app.use('/api/user-balances', userBalanceRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'MTTMS Server is running' });
});

// 5. Base Path (API Prefix)
app.get('/', (req, res) => {
    res.send('API is running...');
});

//6. Error Handling Middlewares (Must be last)
app.use(notFound);
app.use(errorHandler);

//. Server Listen
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
    console.log(`Server started in ${process.env.NODE_ENV} mode on port ${PORT}`);
    console.log('[Email] SMTP configured:', isEmailConfigured());
    if (isEmailConfigured()) {
        const check = await verifyEmailConnection();
        if (!check.ok) {
            console.warn('[Email] Startup SMTP check failed:', check.reason);
        }
    } else {
        console.warn('[Email] Set SMTP_USER and SMTP_PASS in .env to send welcome emails.');
    }
});

//8. Handle Unhandled Promise Rejections (e.g. database errors)
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// 9. Initialize Socket.io
import { initSocket } from './socket.js';
initSocket(server);

export default app;

