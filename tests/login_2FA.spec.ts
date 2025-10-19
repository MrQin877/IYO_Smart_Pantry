import { test, expect } from '@playwright/test';
import { MailSlurp } from 'mailslurp-client';

// 📨 Initialize MailSlurp client
const mailslurp = new MailSlurp({
  apiKey: 'bee6e6c3457c2a530e1122e9508f479931edff008b34b8815ae8a0043852ac4b',
});

test('Login and verify using OTP from MailSlurp', async ({ page }) => {
  console.log('🔑 Starting login + OTP verification test...');

  // 🔐 Existing account credentials
  const EXISTING_INBOX_ID = '46dae2c3-9870-47f2-96da-a6bbc8eacf53';
  const EXISTING_EMAIL = '46dae2c3-9870-47f2-96da-a6bbc8eacf53@mailslurp.biz';
  const PASSWORD = '11111111';

  // 1️⃣ Go to login page
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();

  // 2️⃣ Fill login credentials
  await page.getByRole('textbox', { name: 'Email' }).fill(EXISTING_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();

  // 3️⃣ Wait for OTP email
  console.log('📨 Waiting for login verification email...');
  const email = await mailslurp.waitForLatestEmail(EXISTING_INBOX_ID, 60000, true);
  if (!email) throw new Error('❌ No login verification email received.');

  console.log(`📩 Subject: ${email.subject}`);
  console.log(`🕒 Received at: ${email.createdAt}`);

  // 4️⃣ Extract OTP code from the email body
  const htmlBody = email.body || email.html || '';
  const otpMatch = htmlBody.match(/<p[^>]*>\s*([0-9]{6})\s*<\/p>/i);
  const otpCode = otpMatch ? otpMatch[1] : null;

  if (!otpCode) {
    console.error('❌ Could not find OTP. Email body:\n', htmlBody.slice(0, 500));
    throw new Error('OTP not found in email HTML');
  }

  console.log(`✅ Extracted OTP Code: ${otpCode}`);

  // 5️⃣ Enter OTP on verification screen
  await page.getByRole('textbox', { name: 'Enter 6-digit code' }).fill(otpCode);
  await page.getByRole('button', { name: 'Verify' }).click();

  // 6️⃣ Confirm successful login (adjust to your app)
  await expect(page).toHaveURL(/dashboard|home|profile|settings/i);
  console.log('🎉 Login + OTP verification successful!');
});
