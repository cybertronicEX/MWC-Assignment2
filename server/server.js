const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(require('./middleware/requestLogger'));



app.use('/api/auth', require('./routes/authRoutes')); // We'll assume this might be needed later or remove if purely client-side auth
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/recommendations', require('./routes/recommendationRoutes'));
app.use('/api/validation', require('./routes/validationRoutes'));
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/audit', require('./routes/auditRoutes'));


// Swagger Documentation
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);

});
