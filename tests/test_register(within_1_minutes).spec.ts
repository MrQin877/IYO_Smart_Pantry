// ST-RP1
import { test, expect } from '@playwright/test';
import { MailSlurp } from 'mailslurp-client';

// Initialize MailSlurp client
const mailslurp = new MailSlurp({
  apiKey: 'bee6e6c3457c2a530e1122e9508f479931edff008b34b8815ae8a0043852ac4b',
});

test('Register and verify email with OTP from MailSlurp within 1 minute', async ({ page }) => {
  // 1️⃣ Create a temporary inbox
  console.log('📬 Creating a new temporary inbox...');
  const inbox = await mailslurp.createInbox();
  const tempEmail = inbox.emailAddress;
  console.log(`✅ Temp email created: ${tempEmail}`);

  // 2️⃣ Go to app and start registration
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('button', { name: 'Register' }).click();
  await page.getByRole('textbox', { name: 'Full Name' }).fill('Elain');
  await page.getByRole('textbox', { name: 'Email' }).fill(tempEmail);
  await page.getByRole('textbox', { name: 'Password (minimum 8' }).fill('11111111');

  // Start timer
  const startTime = Date.now();

  await page.getByRole('button', { name: 'Register' }).click();

  // 3️⃣ Wait for verification email
  console.log('📨 Waiting for verification email...');
  const email = await mailslurp.waitForLatestEmail(inbox.id, 60000, true);
  if (!email) throw new Error('❌ No verification email received.');

  console.log(`📩 Subject: ${email.subject}`);
  const htmlBody = email.body || email.html || '';

  // 4️⃣ Extract OTP code from email
  const otpMatch = htmlBody.match(/<p[^>]*>\s*([0-9]{6})\s*<\/p>/i);
  const otpCode = otpMatch ? otpMatch[1] : null;

  if (!otpCode) {
    console.error('❌ Could not find OTP. Email body:\n', htmlBody.slice(0, 500));
    throw new Error('OTP not found in email HTML');
  }

  console.log(`✅ Extracted OTP Code: ${otpCode}`);

  // 5️⃣ Fill OTP verification form
  await page.getByRole('textbox', { name: 'Enter 6-digit code' }).fill(otpCode);
  await page.getByRole('textbox', { name: 'Enter new password (min 8' }).fill('11111111');
  await page.getByRole('button', { name: 'Verify' }).click();

  // 6️⃣ Measure elapsed time
  const elapsedSeconds = (Date.now() - startTime) / 1000;
  console.log(`⏱️ OTP verification completed in ${elapsedSeconds.toFixed(2)} seconds`);

  // 7️⃣ Assert OTP verification is within 1 minute
  expect(elapsedSeconds).toBeLessThan(60);

  // 8️⃣ Verifys success — adjust the URL check to match your app
  await expect(page).toHaveURL(/dashboard|login|success/i);
  console.log('🎉 Registration and verification completed successfully!');
});