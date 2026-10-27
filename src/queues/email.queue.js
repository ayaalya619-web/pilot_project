const { Queue, Worker } = require('bullmq');
const IORedis = require('ioredis');

const redisConnection = new IORedis({
    host: process.env.REDIS_HOST || 'redis',
    port: 6379,
    maxRetriesPerRequest: null
});

const emailQueue = new Queue('emailQueue', { connection: redisConnection });

const emailWorker = new Worker('emailQueue', async (job) => {
    const { userId, userEmail, postTitle } = job.data;
    
    console.log(`[Background Job] Processing email for user ${userId} regarding post: "${postTitle}"`);
    
    // 
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    
    console.log(`[Background Job] Email successfully sent to ${userEmail}`);
}, { connection: redisConnection });

emailWorker.on('failed', (job, err) => {
    console.error(`[Background Job Error] Job ${job.id} failed: ${err.message}`);
});

module.exports = { emailQueue };
