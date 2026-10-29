import express, { Application } from 'express';
import http from 'http';
import config from './config/env.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import errorHandler from './middlewares/errorHandler.js';
import morgan from 'morgan';
import logger from './config/logger.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { initSocket } from './config/socket.js';
import { initTelegramBot } from './config/telegram.js';

const app: Application = express();
const server = http.createServer(app);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initSocket(server);
//initTelegramBot(app);

const morganFormat = ':method :url :status :res[content-length] - :response-time ms';
app.use(morgan(morganFormat, {
    stream: { write: (message: string) => logger.info(message.trim()) }
}));


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

app.use(errorHandler);

server.listen(config.port, () => {
    logger.info(`🚀 Server with Socket.io is running on port ${config.port}`);
});
