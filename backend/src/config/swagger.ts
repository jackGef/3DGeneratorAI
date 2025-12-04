import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '3D Generator API',
      version: '1.0.0',
      description: 'Text-to-3D generation API with authentication, chat, jobs, and asset management',
      contact: {
        name: 'API Support',
        email: 'support@3dgenerator.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:8081',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            email: { type: 'string', format: 'email', example: 'user@example.com' },
            userName: { type: 'string', example: 'johndoe' },
            emailVerified: { type: 'boolean', example: true },
            roles: { type: 'array', items: { type: 'string' }, example: ['user'] },
            isActive: { type: 'boolean', example: true },
            profile: {
              type: 'object',
              properties: {
                avatarUrl: { type: 'string', example: 'https://example.com/avatar.jpg' },
                bio: { type: 'string', example: 'A passionate 3D artist' },
              },
            },
            settings: {
              type: 'object',
              properties: {
                theme: { type: 'string', enum: ['light', 'dark'], example: 'dark' },
                language: { type: 'string', example: 'en' },
                notifications: {
                  type: 'object',
                  properties: {
                    jobFinished: { type: 'boolean', example: true },
                  },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Chat: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            title: { type: 'string', example: 'My 3D Project' },
            lastMessageAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Message: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            chatId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            role: { type: 'string', enum: ['user', 'assistant'], example: 'user' },
            type: { type: 'string', enum: ['text', 'image', 'model'], example: 'text' },
            content: { type: 'string', example: 'Generate a red cube' },
            attachments: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: { type: 'string', example: 'image' },
                  url: { type: 'string', example: 'https://example.com/image.jpg' },
                },
              },
            },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Job: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            prompt: { type: 'string', example: 'A red cube' },
            status: {
              type: 'string',
              enum: ['queued', 'running', 'completed', 'failed', 'canceled'],
              example: 'completed',
            },
            params: { type: 'object', example: {} },
            startedAt: { type: 'string', format: 'date-time' },
            finishedAt: { type: 'string', format: 'date-time' },
            error: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        Asset: {
          type: 'object',
          properties: {
            _id: { type: 'string', example: '507f1f77bcf86cd799439011' },
            userId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            jobId: { type: 'string', example: '507f1f77bcf86cd799439011' },
            url: { type: 'string', example: '/assets/model.glb' },
            format: { type: 'string', example: 'glb' },
            size: { type: 'number', example: 1024000 },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string', example: 'Error message' },
            details: { type: 'object' },
          },
        },
      },
    },
    security: [
      {
        BearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to API docs
};

export const swaggerSpec = swaggerJsdoc(options);
