import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';
import 'reflect-metadata';
import employeeRoutes from './routes/employeeRoutes';
import authRoutes from './routes/authRoutes';
import { errorHandler } from './middlewares/errorHandler';
import { requestIdMiddleware } from './middlewares/requestId';
import { authenticate } from './middlewares/authenticate';
import { container } from './containers/inversify.config';
import { TYPES } from './constants/types';
import { Logger } from './utils/Logger';
const app: Application = express();
const PORT = process.env.PORT || 3000;
const logger = new Logger('Server');

// Middlewares
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') ?? [],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
}));
app.use(express.json({ limit: '10kb' }));
app.use(requestIdMiddleware);
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
}));

// Health Check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'OK', message: 'HRM Service is running' });
});

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes
app.use(authenticate);
app.use('/api/employees', employeeRoutes);

// Error Handler (must be placed after all routes)
app.use(errorHandler);

const server = app.listen(PORT, () => {
  logger.info(`Server is running at http://localhost:${PORT}`);
});

// Graceful shutdown
async function shutdown(signal: string): Promise<void> {
  logger.info(`Received ${signal}, shutting down gracefully...`);
  const prisma = container.get<PrismaClient>(TYPES.PrismaClient);
  server.close(async () => {
    await prisma.$disconnect();
    logger.info('Server closed');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

