import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/authRoutes.js';
import bookRoutes from './routes/bookRoutes.js';
import issueRoutes from './routes/issueRoutes.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 100, standardHeaders: true, legacyHeaders: false }));
app.get('/api/health', (req, res) => res.json({ status: 'ok', service: 'campuslibrary-api' }));
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/issues', issueRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
