import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import routes from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
const app = express();

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SEMICRO API',
      version: '1.0.0',
      description: 'Sistema de Microcréditos - API Documentation',
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development server' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    }
  },
  apis: ['./src/routes/*.js'] // Esta debería funcionar
};


const swaggerSpec = swaggerJSDoc(options);

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  explorer: true,
  customSiteTitle: "SEMICRO API Documentation"
  
}));
// Después de crear swaggerSpec, agrega esto:
console.log('🔍 Debug Swagger:');
console.log('Directorio actual:', __dirname);
console.log('Rutas buscadas:', [
  './src/routes/*.js',
  './src/routes/**/*.js', 
  join(__dirname, 'routes/*.js'),
  join(__dirname, 'routes/**/*.js')
]);
console.log('Endpoints encontrados:', Object.keys(swaggerSpec.paths || {}));

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

// Ruta para verificar la especificación Swagger
app.get('/swagger.json', (req, res) => {
  res.json(swaggerSpec);
});

// Manejo de errores
app.use(errorHandler);

// Log para verificar
console.log('🔄 Buscando rutas en:', [
  join(__dirname, './routes/*.js'),
  join(__dirname, './routes/**/*.js')
]);

export default app;