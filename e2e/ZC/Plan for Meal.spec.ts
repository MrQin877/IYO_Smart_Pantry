import { test, expect } from '@playwright/test';

test('Smart Pantry - Plan for Meal action (robust)', async ({ page }) => {
  test.setTimeout(90000);

  // Handle dialogs
  page.on('dialog', async (dialog) => {
    console.log(`⚠️ Dialog: ${dialog.message()}`);
    await dialog.dismiss().catch(() => {});
  });

  // 1️⃣ Go to homepage
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });

  // 2️⃣ Login
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('zclim01234@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.waitForLoadState('networkidle');

  // 3️⃣ Go to Food Center
  await page.getByRole('link', { name: 'Food Center' }).click();
  await page.waitForLoadState('networkidle');

  // 4️⃣ Open Food Detail
  console.log('🔍 Opening food details...');
  await page.getByRole('button', { name: '👁️' }).nth(2).click();
  await expect(page.getByText('Food Detail')).toBeVisible({ timeout: 15000 });

  // 5️⃣ Wait for modal to settle
  await page.waitForTimeout(2000);

  // 6️⃣ Try to find "Plan for Meal" (flexible search)
  console.log('🔍 Searching for Plan for Meal button...');
  const planForMeal = page.locator('button:has-text("Plan for Meal")');
  const planAlt = page.locator('button:has-text("Plan")');

  const planExists = await planForMeal.isVisible().catch(() => false);
  const altExists = await planAlt.isVisible().catch(() => false);

  if (!planExists && !altExists) {
    console.log('⚠️ Button not immediately visible. Scrolling and retrying...');
    await page.evaluate(() => window.scrollBy(0, 500));
    await page.waitForTimeout(2000);
  }

  const buttonToClick = planExists ? planForMeal : planAlt;

  await buttonToClick.waitFor({ state: 'visible', timeout: 30000 });
  await buttonToClick.scrollIntoViewIfNeeded();
  await buttonToClick.click({ timeout: 15000 });

  console.log('✅ Clicked "Plan for Meal" successfully.');

  // 7️⃣ Close modal
  const closeBtn = page.getByRole('button', { name: '✕' });
  await closeBtn.waitFor({ state: 'visible', timeout: 10000 });
  await closeBtn.click();

  // 8️⃣ Verify return to Food Center
  await expect(page.getByText('Food Center')).toBeVisible({ timeout: 10000 });
  console.log('✅ Test completed successfully.');
});
