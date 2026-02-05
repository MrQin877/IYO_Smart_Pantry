import { test, expect } from '@playwright/test';

const BASE = 'http://localhost:5173';

/* ============================================================
   LOGIN
   ============================================================ */
async function login(page) {
  console.log('🔐 Logging in...');

  await page.goto(`${BASE}/login`);

  await page.getByRole('textbox', { name: 'Email' }).fill('kuanchinzhong@gmail.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('08012004kcz');

  page.once('dialog', (dialog) => {
    console.log(`Dialog message: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  await page.getByRole('button', { name: 'Login' }).click();

  // Wait for unique element after login
  await expect(page.getByRole('link', { name: 'Food Center' })).toBeVisible();

  console.log('✅ Login success');
}

/* ============================================================
   OPEN NOTIFICATION PAGE
   ============================================================ */
async function openNotification(page) {
  console.log("📨 Opening notification page...");
  await page.goto(`${BASE}/notification`);
  await expect(page.getByText("Notification")).toBeVisible();
  console.log("📨 Notification page loaded");
}

/* ============================================================
   FILL SELECT FIELDS — Using your real <label> text
   ============================================================ */
async function fillAllSelects(page) {
  console.log("🔧 Selecting Category…");
  await page
    .locator('.form-row', { hasText: 'Category' })
    .locator('select')
    .selectOption({ index: 1 });

  console.log("🔧 Selecting Unit…");
  await page
    .locator('.form-row', { hasText: 'Quantity' })
    .locator('select')
    .selectOption({ index: 1 });

  console.log("🔧 Selecting Storage…");
  await page
    .locator('.form-row', { hasText: 'Storage Location' })
    .locator('select')
    .selectOption({ index: 1 });

  console.log("🔧 Dropdown selection completed.");
}


/* ============================================================
   NFR — Notification Must Arrive Within 60 Seconds
   ============================================================ */
test('NFR-NOTI-1: Notification delivered within 60s after adding food', async ({ page }) => {

  await login(page);

  console.log("🍎 Creating a new test item");

  const foodName = `NFR-${Date.now()}`;

  // Go to Add Item modal
  await page.getByRole('link', { name: 'Food Center' }).click();
  await page.getByRole('button', { name: '+ Add Item' }).click();

  // Fill form
  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).fill(foodName);
  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();

  await fillAllSelects(page);

  await page.locator('input[type="date"]').fill('2025-12-31');

  // Capture "Food added" alert
  page.once('dialog', dialog => {
    console.log(`💬 Dialog after Add: ${dialog.message()}`);
    dialog.dismiss().catch(() => {});
  });

  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  await expect(addBtn).toBeEnabled();

  // NFR TIMER START
  const start = Date.now();
  console.log("⏱ Timer started…");

  await addBtn.click();

  // Go to Notifications
  await openNotification(page);

  // Locate the new notification
  const notif = page.locator('.noti-card', { hasText: foodName }).first();

  console.log("⏳ Waiting for 'New Food Added' notification (max 60s)...");

  await notif.waitFor({ state: 'visible', timeout: 60000 });

  // TIMER END
  const elapsedSeconds = (Date.now() - start) / 1000;
  console.log(`⏱ Notification arrived in ${elapsedSeconds.toFixed(2)} seconds`);

  // Validate NFR
  expect(elapsedSeconds).toBeLessThan(60);

  console.log("🎉 NFR PASSED: Notification delivered within 60 seconds!");
});
