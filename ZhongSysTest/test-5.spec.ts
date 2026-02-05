import { test, expect } from '@playwright/test';

test('ST-PWM-x: Full Cook → Done → Cook → Delete flow', async ({ page }) => {

  console.log('[STEP 1] Navigate to website');
  await page.goto('http://localhost:5173/');

  console.log('[STEP 1] Open login form');
  await page.getByRole('link', { name: /login/i }).click();

  console.log('[STEP 1] Fill login credentials');
  await page.getByRole('textbox', { name: /email/i }).fill('kuanchinzhong@gmail.com');
  await page.getByRole('textbox', { name: /password/i }).fill('08012004kcz');

  page.once('dialog', async d => { console.log(`[Dialog] ${d.message()}`); await d.dismiss(); });

  console.log('[STEP 1] Submit login');
  await page.getByRole('button', { name: /login/i }).click();

  await expect(page.getByRole('link', { name: /plan meals/i })).toBeVisible();

  console.log('[STEP 2] Go to Meal Planner');
  await page.getByRole('link', { name: /plan meals/i }).click();


  /***********************
   * STEP 3 — FIRST COOK
   ***********************/
  console.log('[STEP 3] Select first empty meal slot...');
  const firstSlot = page.locator('.meal-add').first();
  await expect(firstSlot).toBeVisible();
  await firstSlot.click();

  console.log('[STEP 3] Click Cook button');
  await page.getByRole('button', { name: /^cook$/i }).first().click();

  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: /cook now/i }).click();


  /***********************
   * STEP 4 — WAIT FOR UPDATED TABLE
   ***********************/
  console.log('[STEP 4] Waiting for cooked meal to appear in the table...');
  const cookedMealCell = page.locator('.meal-filled:has-text("Veggie Omelette")').first();
  await cookedMealCell.waitFor({ state: 'visible', timeout: 5000 });

  console.log('[STEP 4] Open cooked meal modal');
  await cookedMealCell.click();

  console.log('[STEP 4] Mark as Done');
  await expect(page.getByRole('button', { name: /mark as done/i })).toBeVisible();
  await page.getByRole('button', { name: /mark as done/i }).click();


  /***********************
   * STEP 5 — SECOND COOK
   ***********************/
  console.log('[STEP 5] Select another empty slot');
  const secondSlot = page.locator('.meal-add').nth(1);
  await expect(secondSlot).toBeVisible();
  await secondSlot.click();

  console.log('[STEP 5] Click Cook button');
  await page.getByRole('button', { name: /^cook$/i }).first().click();

  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: /cook now/i }).click();


  console.log('[STEP 5] Waiting for second cooked meal...');
  const secondCookedCell = page.locator('.meal-filled:has-text("Veggie Omelette")').nth(1);
  await secondCookedCell.waitFor({ state: 'visible', timeout: 5000 });
  await secondCookedCell.click();


  /***********************
   * STEP 6 — DELETE
   ***********************/
  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: /^delete$/i }).click();

  page.once('dialog', d => d.dismiss());
  await page.getByRole('button', { name: /^delete$/i }).click();

  console.log('[RESULT] Test finished successfully');
});
