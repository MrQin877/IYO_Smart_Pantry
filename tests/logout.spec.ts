import { test, expect } from '@playwright/test';

test('Login without 2FA when disabled', async ({ page }) => {
  console.log('🚀 Starting test: Login without 2FA when disabled');

  // 1️⃣ Navigate to the homepage
  console.log('🌐 Navigating to homepage...');
  await page.goto('http://localhost:5173/');
  console.log('✅ Reached homepage.');

  // 2️⃣ Click on the "Login" link
  console.log('🧭 Clicking on the "Login" link...');
  await page.getByRole('link', { name: 'Login' }).click();
  console.log('✅ Login page opened.');

  // 3️⃣ Enter a valid email address
  const email = '6257b891-b05e-48cc-9617-c3dab9b5a138@mailslurp.biz';
  console.log(`📧 Filling in email: ${email}`);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  console.log('✅ Email filled.');

  // 4️⃣ Enter a valid password
  const password = '11111111';
  console.log('🔒 Filling in password...');
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  console.log('✅ Password filled.');

  // 5️⃣ Handle any potential dialog (alert messages)
  console.log('⚠️ Setting up dialog handler...');
  page.once('dialog', dialog => {
    console.log(`💬 Dialog appeared: "${dialog.message()}"`);
    dialog.dismiss().catch(() => console.warn('⚠️ Dialog dismiss failed'));
  });

  // 6️⃣ Click the "Login" button to submit
  console.log('🔘 Clicking "Login" button...');
  await page.getByRole('button', { name: 'Login' }).click();
  console.log('✅ Login submitted, waiting for redirect...');

  // 7️⃣ Verify redirect to logged-in page
  console.log('⏳ Waiting for dashboard/home/profile page...');
  await expect(page).toHaveURL(/dashboard|home|profile/i, { timeout: 10000 });
  console.log('🎉 Login successful — user redirected to dashboard/home/profile.');

  console.log('✅ Test completed successfully: Login without 2FA.');
  // 8️⃣ Logged-out page
  await page.getByRole('button', { name: '🚪' }).click();
  await page.getByRole('button', { name: 'Yes, logout' }).click();
  console.log('🎉 Logout successful');
});
