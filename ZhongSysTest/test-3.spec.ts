import { test, expect } from '@playwright/test';

test('ST-PWM-1: Quick cook flow from meal planner', async ({ page }) => {
  console.log('[STEP 1] Go to homepage');
  await page.goto('http://localhost:5173/');

  console.log('[STEP 1] Click Login link');
  await page.getByRole('link', { name: 'Login' }).click();

  console.log('[STEP 1] Fill email & password');
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('kuanchinzhong@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('08012004kcz');

  // Set dialog handler BEFORE clicking Login
  page.once('dialog', dialog => {
    console.log(`[DIALOG] Login dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  console.log('[STEP 1] Submit login via button (no Enter)');
  const loginButton = page.getByRole('button', { name: 'Login' });
  await expect(loginButton).toBeEnabled();
  await loginButton.click();

  console.log('[ASSERT] Check "Plan Meals" link is visible after login');
  await expect(page.getByRole('link', { name: 'Plan Meals' })).toBeVisible();

  console.log('[STEP 2] Navigate to Meal Plan');
  await page.getByRole('link', { name: 'Plan Meals' }).click();

  console.log('[STEP 3] Click an empty "+" meal cell (index 5)');
  await page.getByRole('cell', { name: '+' }).nth(5).click();

  console.log('[STEP 4] Click second "Cook" button');
  await page.getByRole('button', { name: 'Cook' }).nth(1).click();

  // Optional: handle any dialog on Cook Now
  page.once('dialog', dialog => {
    console.log(`[DIALOG] Cook Now dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  console.log('[STEP 5] Confirm "Cook Now"');
  await page.getByRole('button', { name: 'Cook Now' }).click();

  console.log('[END] Test flow completed');
});
