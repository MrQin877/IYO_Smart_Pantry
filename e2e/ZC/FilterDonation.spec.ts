import { test, expect } from '@playwright/test';

test('User logs in, navigates to Donation, applies and clears filter', async ({ page }) => {
  // Go to homepage
  await page.goto('http://localhost:5173/');

  // Click "Login"
  await page.getByRole('link', { name: 'Login' }).click();

  // Fill in login form
  await page.getByRole('textbox', { name: 'Email' }).fill('zclim01234@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');

  // Handle any alert popup (if login triggers one)
  page.once('dialog', async (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    await dialog.dismiss();
  });

  // Click "Login" and wait for the next page to load
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: 'Login' }).click(),
  ]);

  // Wait until the Food Center link appears (indicates login success)
  await expect(page.getByRole('link', { name: 'Food Center' })).toBeVisible({ timeout: 10000 });

  // Navigate to "Food Center"
  await page.getByRole('link', { name: 'Food Center' }).click();

  // Wait until "Donation" link is visible
  await expect(page.getByRole('link', { name: 'Donation' })).toBeVisible({ timeout: 10000 });

  // Go to "Donation" page
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('link', { name: 'Donation' }).click(),
  ]);

  // Confirm we’re on Donation page
  await expect(page).toHaveURL(/.*donation/i);
  await expect(page.getByRole('button', { name: 'Filter' })).toBeVisible();

  // --- Apply Filter ---
  await page.getByRole('button', { name: 'Filter' }).click();

  // Wait for filter dropdowns to appear
  await expect(page.getByRole('combobox').first()).toBeVisible({ timeout: 5000 });

  // Select category and expiry option
  await page.getByRole('combobox').first().selectOption('C3');
  await page.getByRole('combobox').nth(1).selectOption('nextmonth');

  // Apply filter
  await Promise.all([
    page.waitForLoadState('networkidle'),
    page.getByRole('button', { name: 'Apply' }).click(),
  ]);

  // Optional: verify filtered results (if a table or list updates)
  await expect(page.locator('table, .food-list')).toBeVisible({ timeout: 5000 });

  // --- Clear Filter ---
  await page.getByRole('button', { name: 'Filter' }).click();
  await expect(page.getByRole('button', { name: 'Clear' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear' }).click();

  // Optional: verify reset (e.g. all items visible again)
  await expect(page.locator('table, .food-list')).toBeVisible({ timeout: 5000 });
});
