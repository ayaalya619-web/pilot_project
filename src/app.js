const express = require('express');
const config = require('./config/env.js');
const userRoutes = require('./routes/user.route.js');
const errorHandler = require('./middlewares/errorHandler.js');

const app = express();

app.use(express.json());

app.use('/api/users', userRoutes);

app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 [Server] Enterprise Layered Architecture running on port: ${config.port}`);
});
