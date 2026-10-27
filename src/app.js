const express = require('express');
const config = require('./config/env.js');
const userRoutes = require('./routes/user.route.js');
const postRoutes = require('./routes/post.route.js');
const errorHandler = require('./middlewares/errorHandler.js');
const morgan = require('morgan');
const logger = require('./config/logger');
const path = require('path');

const app = express();

app.use(express.json());

const morganFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(morganFormat, {
    stream: { write: (message) => logger.info(message.trim()) }
}));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// var bodyParser = require('body-parser');
// app.use(bodyParser.json());
//app.use(express.urlencoded({ extended: true }));

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(errorHandler);

app.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 [Server] Enterprise Layered Architecture running on port: ${config.port}`);
});
