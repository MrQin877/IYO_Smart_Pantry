import { test, expect } from '@playwright/test';

test('Filter performance: Food inventory displays in <5s', async ({ page }) => {
  // 1️⃣ Go to homepage and login
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('zclim01234@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');

  // Handle any alert dialogs
  page.once('dialog', dialog => dialog.dismiss());

  await page.getByRole('button', { name: 'Login' }).click();

  // 2️⃣ Navigate to Food Center
  await page.getByRole('link', { name: 'Food Center' }).click();

  // 3️⃣ Open filter panel
  await page.getByRole('button', { name: 'Filter' }).click();

  // 4️⃣ Select filter options
  await page.getByRole('combobox').first().selectOption('C3');          // Category
  await page.getByRole('combobox').nth(1).selectOption('nextmonth');   // Expiry
  await page.getByRole('combobox').nth(2).selectOption('ST1');         // Storage

  // ⏱ Start timing
  const startTime = Date.now();

  // 5️⃣ Apply filter
  await page.getByRole('button', { name: 'Apply' }).click();

  // 6️⃣ Wait for filtered item to appear
  // Replace 'Orange Juice' with a known item that matches the filter
  const filteredItem = page.getByText('Orange Juice', { timeout: 5000 });
  await expect(filteredItem).toBeVisible();

  // ⏱ End timing
  const endTime = Date.now();
  const duration = (endTime - startTime) / 1000; // seconds
  console.log(`✅ Filter applied in ${duration.toFixed(2)} seconds`);

  // 7️⃣ Assert it took less than 5 seconds
  expect(duration).toBeLessThan(5);

  console.log('🎉 Filter performance test passed!');
});
