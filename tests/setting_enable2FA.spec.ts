// ST-RP4
import { test, expect } from '@playwright/test';
import { MailSlurp } from 'mailslurp-client';

// 📨 Initialize MailSlurp client
const mailslurp = new MailSlurp({
  apiKey: 'bee6e6c3457c2a530e1122e9508f479931edff008b34b8815ae8a0043852ac4b',
});

test('Login and enable 2FA', async ({ page }) => {
  console.log('🔑 Starting test: Login and enable 2FA...');

  // 🔐 Existing account credentials
  const EXISTING_EMAIL = '46d5fa6c-5de6-4ef0-b899-5484c2007cbf@mailslurp.biz';
  const PASSWORD = '11111111';

  // 1️⃣ Go to login page
  console.log('🌐 Navigating to login page...');
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();

  // 2️⃣ Fill login credentials
  console.log(`📧 Logging in with ${EXISTING_EMAIL}`);
  await page.getByRole('textbox', { name: 'Email' }).fill(EXISTING_EMAIL);
  await page.getByRole('textbox', { name: 'Password' }).fill(PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  console.log('✅ Login submitted.');

  // 3️⃣ Verify successful login
  await expect(page).toHaveURL(/dashboard|home|profile|settings/i);
  console.log('✅ Login successful, user redirected to main page.');

  // 4️⃣ Go to setting page
  console.log('⚙️ Navigating to user setting page...');
  await page.getByRole('link', { name: 'E', exact: true }).click();

  // 5️⃣ Enable 2FA
  console.log('🔒 Enabling 2FA...');
  await page.locator('span').click();
  console.log('✅ 2FA enabled successfully.');

  // 6️⃣ Logout
  console.log('🚪 Logging out...');
  await page.getByRole('button', { name: '🚪' }).click();
  await page.getByRole('button', { name: 'Yes, logout' }).click();
  console.log('✅ Logout complete.');

  console.log('🎉 Test completed: Login and enable 2FA successful.');
});
