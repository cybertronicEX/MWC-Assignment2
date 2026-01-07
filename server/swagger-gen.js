const swaggerAutogen = require('swagger-autogen')({ openapi: '3.0.0' });

const doc = {
    openapi: '3.0.0',
    info: {
        title: 'Digital Knowledge Network API',
        description: 'API for Velion Dynamics DKN System',
    },
    host: 'localhost:5000',
    schemes: ['http'],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT'
            }
        }
    },
    security: [
        {
            bearerAuth: []
        }
    ]
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./server.js']; // Only entry point to preserve route prefixes

/* NOTE: if you use the express Router, you must pass in the 
   'endpointsFiles' only the root file where the route starts,
   such as index.js, app.js, routes.js, ... */

swaggerAutogen(outputFile, endpointsFiles, doc).then(() => {
    console.log('Swagger documentation generated!');
});
