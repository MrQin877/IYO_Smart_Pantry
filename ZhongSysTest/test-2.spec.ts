import { test, expect } from '@playwright/test';

test('ST-VN3', async ({ page }) => {
  console.log('🚀 Starting test: Meal Plan → Cook → Notification appears');

  // ---------------------------------
  // LOGIN
  // ---------------------------------
  console.log('🏁 Navigating to homepage...');
  await page.goto('http://localhost:5173/');

  console.log('🔐 Opening Login...');
  await page.getByRole('link', { name: 'Login' }).click();

  console.log('📝 Filling credentials...');
  await page.getByRole('textbox', { name: 'Email' }).fill('kuanchinzhong@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('08012004kcz');

  // Login dialog
  page.once('dialog', dialog => {
    console.log(`💬 Login dialog: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  console.log('👉 Clicking "Login"...');
  await page.getByRole('button', { name: 'Login' }).click();

  // Expect dashboard loaded
  await expect(page).not.toHaveURL(/login/);
  console.log('✅ Login successful!');

  // ---------------------------------
  // OPEN MEAL PLANNER
  // ---------------------------------
  console.log('🍽️ Opening Plan Meals...');
  await page.getByRole('link', { name: 'Plan Meals' }).click();
  await expect(page).toHaveURL(/meal-planner/);
  console.log('✅ Meal Planner opened.');

  // ---------------------------------
  // CLICK AN EXISTING MEAL CELL
  // (Do NOT use tr:nth-child() — unstable!)
  // ---------------------------------
  console.log('🔍 Searching for a meal cell with an existing recipe...');
  const mealCell = page.locator('td.meal-cell:has-text("")').first();
  await expect(mealCell).toBeVisible();
  console.log('👉 Clicking meal cell...');
  await mealCell.click();

  // ---------------------------------
  // COOK
  // ---------------------------------
  console.log('🍳 Clicking "Cook"...');
  await page.getByRole('button', { name: /^Cook$/ }).first().click();

  // "Cook Now" dialog
  page.once('dialog', dialog => {
    console.log(`💬 Cook dialog: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  console.log('🔥 Clicking "Cook Now"...');
  await page.getByRole('button', { name: 'Cook Now' }).click();

  // ---------------------------------
  // OPEN NOTIFICATIONS
  // ---------------------------------
  console.log('🔔 Opening Notifications...');
  await page.getByRole('link', { name: 'Notifications' }).click();
  await expect(page).toHaveURL(/notification/);
  console.log('✅ Notifications page opened.');

  // ---------------------------------
  // FIND THE NEW MEAL PLAN REMINDER
  // ---------------------------------
  console.log('🔍 Looking for Meal Plan Reminder notification...');
  const notif = page.locator('.noti-card', { hasText: /Meal Plan/i }).first();
  await expect(notif).toBeVisible();

  console.log('👉 Clicking Meal Plan notification...');
  await notif.click();

  console.log('🎉 Test Completed Successfully');
});
