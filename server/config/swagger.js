const swaggerJsdoc = require('swagger-jsdoc');

const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Digital Knowledge Network API',
            version: '1.0.0',
            description: 'API documentation for Velion Dynamics DKN System',
            contact: {
                name: 'Velion Dev Team',
            },
        },
        servers: [
            {
                url: 'http://localhost:5000/api',
                description: 'Local Development Server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./routes/*.js'], // Path to the API docs
};

const specs = swaggerJsdoc(options);

module.exports = specs;
