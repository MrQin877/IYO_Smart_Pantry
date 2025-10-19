import { test, expect } from '@playwright/test';


const BASE_URL ='http://localhost:5173/';

async function login(page) {
  await page.goto(BASE_URL);
  await page.getByRole('link', { name: 'Login' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill('qinchong877@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('08012004kcz');

  page.once('dialog', async dialog => {
    console.log('Dialog message:', dialog.message());
    await dialog.dismiss().catch(() => {});
  });

  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for Food Center link (guarantee login success)
  await expect(page.getByRole('link', { name: 'Food Center' })).toBeVisible();
}

test('add', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Food Center' }).click();
  await page.getByRole('button', { name: '+ Add Item' }).click();

  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).fill('Orange');
  await page.getByRole('combobox').first().selectOption('C3');
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('combobox').nth(1).selectOption('UN3');
  await page.locator('input[type="date"]').fill('2025-11-15');

  page.once('dialog', async dialog => {
    console.log('Dialog message:', dialog.message());
    await dialog.dismiss().catch(() => {});
  });

  await page.getByRole('button', { name: 'Add', exact: true }).click();
});

test('edit', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Food Center' }).click();
  // ensure items loaded
  await expect(page.getByRole('button', { name: '✏️' }).first()).toBeVisible();

  await page.getByRole('button', { name: '✏️' }).first().click();
  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).fill('Cucumber');
  await page.getByRole('combobox').first().selectOption('C4');
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('combobox').nth(1).selectOption('UN4');
  await page.locator('input[type="date"]').fill('2025-11-15');

  page.once('dialog', async dialog => {
    console.log('Dialog message:', dialog.message());
    await dialog.dismiss().catch(() => {});
  });

  await page.getByRole('button', { name: 'Save' }).click();
});

test('delete', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Food Center' }).click();
  await expect(page.getByRole('button', { name: '🗑️' }).first()).toBeVisible();

  await page.getByRole('button', { name: '🗑️' }).nth(2).click();

  page.once('dialog', async dialog => {
    console.log('Dialog message:', dialog.message());
    await dialog.dismiss().catch(() => {});
  });

  await page.getByRole('button', { name: 'Delete' }).click();
});
// Optional: tiny helper to assert button becomes enabled (surface nice debug if not)
async function clickWhenEnabled(page: Page, roleName: string, timeoutMs = 7000) {
  const btn = page.getByRole('button', { name: roleName });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled({ timeout: timeoutMs });
  await btn.click();
}

// ---------- test ----------
test('convert', async ({ page }) => {
  await login(page);

  await page.getByRole('link', { name: 'Food Center' }).click();
  await page.getByRole('button', { name: '>' }).click();
  await page.getByRole('button', { name: '👁️' }).first().click();
  await page.getByRole('button', { name: 'Donate' }).click();
  await page.getByRole('textbox', { name: '-3456789' }).click();
  await page.getByRole('textbox', { name: '-3456789' }).fill('01234565');
  await page.getByRole('textbox').nth(2).click();
  await page.getByRole('textbox').nth(2).fill('No12');
  await page.getByRole('textbox').nth(3).click();
  await page.getByRole('textbox').nth(3).fill('ABC');
  await page.getByRole('textbox').nth(4).click();
  await page.getByRole('textbox').nth(4).fill('ABC');
  await page.getByRole('textbox').nth(5).click();
  await page.getByRole('textbox').nth(5).fill('40160');
  await page.locator('div:nth-child(5) > .input').click();
  await page.locator('div:nth-child(5) > .input').fill('Shah Alam');
  await page.locator('div:nth-child(6) > .input').click();
  await page.locator('div:nth-child(6) > .input').fill('Selangor');
  await page.locator('div:nth-child(7) > .input').click();
  await page.locator('div:nth-child(7) > .input').fill('Malaysia');
  await page.locator('input[type="date"]').fill('2025-10-29');
  await page.locator('input[type="time"]').first().click();
  await page.locator('input[type="time"]').first().press('ArrowLeft');
  await page.locator('input[type="time"]').first().press('ArrowLeft');
  await page.locator('input[type="time"]').first().fill('15:10');
  await page.locator('input[type="time"]').first().press('ArrowRight');
  await page.locator('input[type="time"]').nth(1).click();
  await page.locator('input[type="time"]').nth(1).press('ArrowLeft');
  await page.locator('input[type="time"]').nth(1).press('ArrowLeft');
  await page.locator('input[type="time"]').nth(1).fill('19:10');
  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Publish' }).click();
});

test('donation_add', async ({ page }) => {
  await login(page);
  
  await page.getByRole('link', { name: 'Food Center' }).click();
  await page.getByRole('link', { name: 'Donation' }).click();
  await page.getByRole('button', { name: '+ Add Donation' }).click();
  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).click();
  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).fill('Grape');
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('combobox').first().selectOption('UN4');
  await page.getByRole('textbox', { name: '-3456789' }).click();
  await page.getByRole('textbox', { name: '-3456789' }).fill('0109357777');
  await page.getByRole('combobox').nth(1).selectOption('C3');
  await page.getByRole('textbox').nth(2).fill('2025-11-15');
  await page.getByRole('textbox').nth(4).click();
  await page.getByRole('textbox').nth(4).fill('No.13');
  await page.getByRole('textbox').nth(5).click();
  await page.getByRole('textbox').nth(5).fill('ABC');
  await page.locator('div:nth-child(6) > div:nth-child(3) > .input').click();
  await page.locator('div:nth-child(6) > div:nth-child(3) > .input').fill('Bukit Help Universe');
  await page.locator('div:nth-child(4) > .input').click();
  await page.locator('div:nth-child(4) > .input').fill('40160');
  await page.locator('div:nth-child(5) > .input').click();
  await page.locator('div:nth-child(5) > .input').fill('Shah Alam');
  await page.locator('div:nth-child(6) > .input').click();
  await page.locator('div:nth-child(6) > .input').fill('Selangor');
  await page.locator('div:nth-child(7) > .input').click();
  await page.locator('div:nth-child(7) > .input').fill('Malaysia');
  await page.locator('input[type="date"]').nth(1).fill('2025-10-29');
  await page.locator('input[type="time"]').first().click();
  await page.locator('input[type="time"]').first().press('ArrowLeft');
  await page.locator('input[type="time"]').first().press('ArrowLeft');
  await page.locator('input[type="time"]').first().fill('14:23');
  await page.locator('input[type="time"]').nth(1).click();
  await page.locator('input[type="time"]').nth(1).press('ArrowLeft');
  await page.locator('input[type="time"]').nth(1).press('ArrowLeft');
  await page.locator('input[type="time"]').nth(1).fill('17:55');
  await page.getByRole('button', { name: '+ Add', exact: true }).click();
  page.once('dialog', dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });
  await page.getByRole('button', { name: 'Publish' }).click();
});