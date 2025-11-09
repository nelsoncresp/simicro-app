import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'SIMICRO API funcionando',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
app.use('/api', routes);

// Manejo de errores
app.use(errorHandler);

export default app;