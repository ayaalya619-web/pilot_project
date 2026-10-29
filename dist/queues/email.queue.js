import { Queue, Worker } from 'bullmq';
import { redisClient } from '../utils/redis.util.js';
export const emailQueue = new Queue('emailQueue', { connection: redisClient });
export const emailWorker = new Worker('emailQueue', async (job) => {
    const { userId, userEmail, postTitle } = job.data;
    console.log(`[Background Job] Processing email for user ${userId} regarding post: "${postTitle}"`);
    await new Promise(resolve => setTimeout(resolve, 3000));
    console.log(`[Background Job] Email successfully sent to ${userEmail}`);
}, { connection: redisClient });
emailWorker.on('failed', (job, err) => {
    console.error(`[Background Job Error] Job ${job?.id} failed: ${err.message}`);
});
