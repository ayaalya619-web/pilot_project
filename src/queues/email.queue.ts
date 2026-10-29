import { Queue, Worker, Job } from 'bullmq';
import { redisClient } from '../utils/redis.util.js'; 

interface EmailJobData {
    userId: string | number;
    userEmail: string;
    postTitle: string;
}

export const emailQueue = new Queue('emailQueue', { connection: redisClient });

export const emailWorker = new Worker('emailQueue', async (job: Job<EmailJobData>) => {
    const { userId, userEmail, postTitle } = job.data;
    
    console.log(`[Background Job] Processing email for user ${userId} regarding post: "${postTitle}"`);
    
    await new Promise(resolve => setTimeout(resolve, 3000)); 
    
    console.log(`[Background Job] Email successfully sent to ${userEmail}`);
}, { connection: redisClient }); 

emailWorker.on('failed', (job: Job | undefined, err: Error) => {
    console.error(`[Background Job Error] Job ${job?.id} failed: ${err.message}`);
});
