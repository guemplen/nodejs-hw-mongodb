import express from 'express';
import pino from 'pino';
import pinoHttp from 'pino-http';
import contactsRouter from './routes/contactsRouter.js';
import authRouter from './routes/auth.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFoundHandler } from './middlewares/notFoundHandler.js';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { swaggerDocs } from './middlewares/swaggerDocs.js';

export const TEMP_UPLOAD_DIR = path.join(process.cwd(), 'temp');
export const UPLOAD_DIR = path.join(process.cwd(), 'uploads');
export const SWAGGER_PATH = path.join(process.cwd(), 'docs', 'swagger.json');

if (!fs.existsSync(TEMP_UPLOAD_DIR)) {
  fs.mkdirSync(TEMP_UPLOAD_DIR, { recursive: true });
}

const app = express();
const logger = pino();

app.use(express.json());
app.use(pinoHttp({ logger }));
app.use(cookieParser());

app.use('/contacts', contactsRouter);
app.use('/auth', authRouter);
app.use('/api-docs', swaggerDocs());

app.use(notFoundHandler);
app.use(errorHandler);

export function setupServer() {
  const PORT = process.env.PORT || 3000;
  const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });

  server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use`);
      process.exit(1);
    } else {
      throw error;
    }
  });
}
