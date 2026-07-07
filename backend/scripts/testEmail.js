/**
 * Quick SMTP test — run: npm run test:email
 * Sends a test message to TEST_EMAIL (or SMTP_USER).
 */
import '../config/loadEnv.js';
import { verifyEmailConnection, sendWelcomeCredentialsEmail } from '../services/emailService.js';

const testTo = process.env.TEST_EMAIL || process.env.SMTP_USER;

async function main() {
  console.log('Verifying SMTP connection...');
  const verify = await verifyEmailConnection();

  if (!verify.ok) {
    console.error('SMTP verification failed:', verify.reason);
    console.error('See backend/EMAIL_SETUP.md for Gmail configuration steps.');
    process.exit(1);
  }

  console.log('SMTP OK. Sending test welcome email to:', testTo);

  const result = await sendWelcomeCredentialsEmail({
    name: 'Test User',
    email: testTo,
    password: 'Test@Password123',
    role: 'user',
  });

  if (result.sent) {
    console.log('Test email sent successfully.', { messageId: result.messageId });
  } else {
    console.error('Failed to send:', result.error);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
