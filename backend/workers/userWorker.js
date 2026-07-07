import { userEventBus, USER_EVENTS } from '../events/userEvents.js';
import { User, USER_ROLES } from '../models/user.model.js';
import { Activity, ACTIVITY_TYPES } from '../models/activity.model.js';
import { sendWelcomeCredentialsEmail } from '../services/emailService.js';
import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';

/**
 * Bulk User Upload Worker
 * Processes CSV files for bulk user creation.
 */

const processBulkUpload = async (data) => {
    const { filePath, adminUser, clientIp, userAgent } = data;
    const results = {
        success: 0,
        failed: 0,
        skipped: 0,
        emailsSent: 0,
        emailsFailed: 0,
        errors: []
    };

    try {
        const workbook = new ExcelJS.Workbook();
        await workbook.csv.readFile(filePath);
        const worksheet = workbook.getWorksheet(1);

        const usersToCreate = [];
        
        // Use a standard loop to handle async/await correctly
        const rowCount = worksheet.rowCount;
        for (let i = 2; i <= rowCount; i++) { // Skip header (row 1)
            const row = worksheet.getRow(i);
            const rowData = {
                name: row.getCell(1).text?.trim(),
                email: row.getCell(2).text?.trim()?.toLowerCase(),
                password: row.getCell(3).text?.trim(),
                role: row.getCell(4).text?.trim()?.toLowerCase(),
                phoneNumber: row.getCell(5).text?.trim(),
                address: row.getCell(6).text?.trim(),
                dob: row.getCell(7).text ? new Date(row.getCell(7).text) : null,
                nationalId: row.getCell(8).text?.trim()
            };

            // Basic row validation
            if (!rowData.name || !rowData.email || !rowData.password || !rowData.role) {
                results.failed++;
                results.errors.push(`Row ${i}: Missing required fields (Name, Email, Password, Role)`);
                continue;
            }

            // Validate role
            if (![USER_ROLES.USER, USER_ROLES.SUPERVISOR].includes(rowData.role)) {
                results.failed++;
                results.errors.push(`Row ${i}: Invalid role '${rowData.role}'. Must be 'user' or 'supervisor'`);
                continue;
            }

            // Check if user exists (Idempotency)
            const exists = await User.findOne({ email: rowData.email });
            if (exists) {
                results.skipped++;
                continue;
            }

            usersToCreate.push(rowData);
        }

        // Batch Create for performance
        if (usersToCreate.length > 0) {
            // Processing in chunks or parallel with individual saves to trigger hooks
            await Promise.all(usersToCreate.map(async (u) => {
                try {
                    await User.create(u);
                    results.success++;

                    const emailResult = await sendWelcomeCredentialsEmail({
                        name: u.name,
                        email: u.email,
                        password: u.password,
                        role: u.role,
                    });
                    if (emailResult.sent) {
                        results.emailsSent++;
                        console.log('[UserWorker] Credentials email sent:', {
                            email: u.email,
                            messageId: emailResult.messageId,
                        });
                    } else {
                        results.emailsFailed++;
                        console.warn('[UserWorker] Credentials email failed:', {
                            email: u.email,
                            reason: emailResult.error,
                        });
                        results.errors.push(`Email ${u.email}: account created but credentials email failed (${emailResult.error})`);
                    }
                } catch (err) {
                    results.failed++;
                    results.errors.push(`Email ${u.email}: ${err.message}`);
                }
            }));
        }

        // Log Activity
        await Activity.logAction({
            user: adminUser._id,
            actionType: ACTIVITY_TYPES.USER_CREATE,
            description: `Bulk Upload Results: ${results.success} Success, ${results.failed} Failed, ${results.skipped} Skipped, ${results.emailsSent} Emails Sent`,
            details: { 
                type: 'BULK_UPLOAD',
                successCount: results.success, 
                failedCount: results.failed, 
                skippedCount: results.skipped,
                emailsSent: results.emailsSent,
                emailsFailed: results.emailsFailed,
                errors: results.errors.slice(0, 10) // Limit errors in activity log
            },
            ipAddress: clientIp,
            userAgent: userAgent,
            category: 'user_management'
        });

        console.log(`[UserWorker] Bulk upload finished. Success: ${results.success}, Failed: ${results.failed}, Skipped: ${results.skipped}`);

    } catch (error) {
        console.error('[UserWorker] Critical breakdown during bulk upload:', error.message);
        await Activity.logAction({
            user: adminUser._id,
            actionType: ACTIVITY_TYPES.USER_CREATE,
            description: `Bulk Upload failed: ${error.message}`,
            details: { type: 'BULK_UPLOAD_ERROR', error: error.message },
            category: 'user_management'
        });
    } finally {
        // Cleanup temp file
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }
};

export const startUserWorker = () => {
    userEventBus.on(USER_EVENTS.BULK_UPLOAD_REQUESTED, processBulkUpload);
    console.log('[Worker] User Management Worker is ACTIVE.');
};
