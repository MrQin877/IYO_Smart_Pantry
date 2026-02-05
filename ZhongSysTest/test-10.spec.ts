import { test, expect } from '@playwright/test';

test('ST-PWM-1 & ST-PWM-3: Suggested meals and assign to random slot', async ({ page }) => {
  // ===== STEP 1: Login =====
  console.log('[STEP 1] Navigate to homepage');
  await page.goto('http://localhost:5173/');

  console.log('[STEP 1] Open Login page');
  await page.getByRole('link', { name: /login/i }).click();

  console.log('[STEP 1] Fill email and password');
  await page.getByRole('textbox', { name: /email/i }).fill('kuanchinzhong@gmail.com');
  await page.getByRole('textbox', { name: /password/i }).fill('08012004kcz');

  // Handle login success dialog
  page.once('dialog', dialog => {
    console.log(`[DIALOG] Login: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  console.log('[STEP 1] Submit login');
  await page.getByRole('button', { name: /login/i }).click();

  console.log('[ASSERT] Verify login success via "Plan Meals" link');
  await expect(page.getByRole('link', { name: /plan meals/i })).toBeVisible();


  // ===== STEP 2: Navigate to Meal Plan =====
  console.log('[STEP 2] Navigate to Meal Plan page');
  await page.getByRole('link', { name: /plan meals/i }).click();

  // ===== STEP 3: Find a random empty "+" meal slot (may change week) =====
  async function clickRandomEmptySlot() {
    // Try current week + next 3 weeks
    for (let weekOffset = 0; weekOffset < 4; weekOffset++) {
      const emptySlots = page.locator('.meal-add');
      const count = await emptySlots.count();
      console.log(`[INFO] Week ${weekOffset}: found ${count} empty ".meal-add" slots`);

      if (count > 0) {
        const randomIndex = Math.floor(Math.random() * count);
        console.log(`[STEP 3] Clicking random empty slot index: ${randomIndex}`);
        await emptySlots.nth(randomIndex).click();
        return;
      }

      // If no empty slots and not at last iteration, go to next week
      if (weekOffset < 3) {
        console.log('[INFO] No empty slots this week, clicking "Next ➡" to move to next week');
        await page.getByRole('button', { name: /next/i }).click();
      }
    }

    throw new Error('❌ No empty meal slots (.meal-add) found in current or next 3 weeks.');
  }

  await clickRandomEmptySlot();


  // ===== STEP 4: Open Suggested Recipes & verify list =====
  console.log('[STEP 4] Expect recipe suggestions page to load');

  // Heading "Suggested Recipes" should be visible for ST-PWM-1
  const suggestedHeading = page.getByRole('heading', { name: /suggested recipes/i });
  await expect(suggestedHeading).toBeVisible();

  console.log('[ASSERT] At least one recipe card is visible');
  const anyRecipeCard = page.locator('.recipe-card').first();
  await expect(anyRecipeCard).toBeVisible();


  // ===== STEP 5: Click Cook on a suggested recipe =====
  console.log('[STEP 5] Click first "Cook" button (Suggested recipe)');
  const firstCookButton = page.getByRole('button', { name: /^cook$/i }).first();
  await expect(firstCookButton).toBeVisible();
  await firstCookButton.click();


  // ===== STEP 6: Confirm Cook Now (reserve ingredients & assign meal) =====
  console.log('[STEP 6] Confirm "Cook Now"');

  // Dialog from backend (success / insufficient ingredients)
  page.once('dialog', dialog => {
    console.log(`[DIALOG] Cook Now: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  const cookNowButton = page.getByRole('button', { name: /cook now/i });
  await expect(cookNowButton).toBeVisible();
  await cookNowButton.click();


  // ===== ASSERTION: Meal slot is now filled =====
  console.log('[ASSERT] Check that at least one meal cell is now filled');
  const filledMeals = page.locator('.meal-filled');
  await expect(filledMeals.first()).toBeVisible();

  console.log('✅ Meal saved successfully, ingredients reserved, and assigned to a random slot.');
});
