import path from 'path';
import swaggerJsdoc from 'swagger-jsdoc';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Sweevil API',
      version: '1.0.0',
      description: 'Admin-only studio management API',
    },
    servers: [{ url: '/api' }],
    components: {
      securitySchemes: {
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'better-auth.session_token',
        },
      },
    },
    security: [{ cookieAuth: [] }],
  },
  apis: [path.join(__dirname, 'routes/*.js')],
};

export const swaggerSpec = swaggerJsdoc(options);
