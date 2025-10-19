import { test, expect } from '@playwright/test';

test('Update Used Quantity', async ({ page }) => {
  // Recording...
  await page.goto('http://localhost:5173/');
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('zclim01234@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill('12345678');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'Food Center' }).click();
  await page.getByRole('button', { name: '👁️' }).first().click();
  await page.getByRole('spinbutton', { name: 'Quantity used:' }).click();
  await page.getByRole('spinbutton', { name: 'Quantity used:' }).fill('1');
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Used' }).click();
});