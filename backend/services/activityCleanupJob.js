import cron from 'node-cron';
import { Activity } from '../models/activity.model.js';

/**
 * Schedule a job to cleanup activities older than 48 hours (2 days) at midnight every day.
 * This ensures we don't store long-term activity history as per business requirements.
 */
const scheduleActivityCleanup = () => {
    // Midnight Cron Expression: '0 0 * * *'
    cron.schedule('0 0 * * *', async () => {
        console.log('[Cron Job] Starting Activity Cleanup...');
        try {
            // Define the cutoff time (Exactly 48 hours ago - 2 days)
            const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

            // Delete all activities where 'timestamp' is before 48 hours ago
            const result = await Activity.deleteMany({
                timestamp: { $lt: fortyEightHoursAgo }
            });

            console.log(`[Cron Job] Activity cleanup successful. Removed ${result.deletedCount} old activities.`);
        } catch (error) {
            console.error('[Cron Job] Error during activity cleanup:', error.message);
        }
    });

    console.log('[Cron Job] Activity Cleanup successfully scheduled for midnight daily (48h retention).');
};

export { scheduleActivityCleanup };
