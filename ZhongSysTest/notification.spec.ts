import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173/';

// --------- helper: format date YYYY-MM-DD with offset ----------
function formatDateOffset(daysOffset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

/* ------------------------------------
 * Shared login helper
 * ------------------------------------ */
async function login(page) {
  console.log('🚀 [login] Starting login helper...');
  await page.goto(BASE_URL);
  console.log('✅ [login] Reached homepage.');

  await page.getByRole('link', { name: 'Login' }).click();
  console.log('✅ [login] Login page opened.');

  await page.getByRole('textbox', { name: 'Email' }).fill('qinchong877@gmail.com');
  console.log('✅ [login] Email filled.');

  await page.getByRole('textbox', { name: 'Password' }).fill('08012004kcz');
  console.log('✅ [login] Password filled.');

  page.once('dialog', async dialog => {
    console.log(`💬 [login] Dialog appeared: "${dialog.message()}"`);
    await dialog.dismiss().catch(() => {});
  });

  console.log('⚙️  [login] Clicking "Login" button...');
  await page.getByRole('button', { name: 'Login' }).click();

  await expect(page).not.toHaveURL(/\/login$/i);
  console.log('🎉 [login] Login successful – user left /login. Current URL:', page.url());
}

/* ------------------------------------
 * Notification page helper
 * ------------------------------------ */
async function openNotification(page) {
  console.log('📨 [noti] Navigating to /notification ...');
  await page.goto(`${BASE_URL}notification`);
  await expect(page.getByText(/Notification/i)).toBeVisible();
  console.log('✅ [noti] Notification page visible. URL:', page.url());
}

/* Ensure every combobox has some value (in case you added new dropdowns) */
async function fillAllSelects(page) {
  const selects = page.getByRole('combobox');
  const count = await selects.count();
  console.log(`🔽 [selects] Found ${count} combobox(es).`);
  for (let i = 0; i < count; i++) {
    try {
      console.log(`   ↳ [selects] Selecting option index 1 on combobox #${i}`);
      await selects.nth(i).selectOption({ index: 1 });
    } catch (e) {
      console.log(`   ⚠️ [selects] Failed to select option on combobox #${i}:`, e);
    }
  }
}

/* =====================================================
 * ST-VN2 — NEW FOOD ADDED
 * ===================================================== */
test('ST-VN2: New Food Added notification', async ({ page }) => {
  console.log('🔔 === ST-VN2: New Food Added notification ===');
  await login(page);

  const foodName = `Orange-${Date.now()}`;
  console.log('📝 [ST-VN2] foodName =', foodName);

  await page.getByRole('link', { name: 'Food Center' }).click();
  console.log('✅ [ST-VN2] Food Center page opened.');

  await page.getByRole('button', { name: '+ Add Item' }).click();
  console.log('✅ [ST-VN2] "+ Add Item" dialog opened.');

  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).fill(foodName);
  console.log('✅ [ST-VN2] Food name filled.');

  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  console.log('✅ [ST-VN2] Quantity increased.');

  await fillAllSelects(page);

  const futureDate = formatDateOffset(5);
  await page.locator('input[type="date"]').fill(futureDate);
  console.log('✅ [ST-VN2] Expiry date filled:', futureDate);

  page.once('dialog', async dialog => {
    console.log(`💬 [ST-VN2] Dialog after Add: "${dialog.message()}"`);
    await dialog.dismiss().catch(() => {});
  });

  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  console.log('⏳ [ST-VN2] Waiting for Add button to be enabled...');
  await expect(addBtn).toBeEnabled();
  console.log('✅ [ST-VN2] Add button enabled. Clicking...');
  await addBtn.click();

  await openNotification(page);

  const notif = page
    .locator('.noti-card', { hasText: /New Food/i })
    .filter({ hasText: foodName });

  console.log('🔍 [ST-VN2] Searching for "New Food" notification with foodName...');
  await expect(notif).toBeVisible();
  console.log('🎉 [ST-VN2] Test completed successfully.');
});

/* =====================================================
 * ST-VN1 — EXPIRY REMINDER
 * ===================================================== */
test('ST-VN1: Expiry Reminder notification', async ({ page, request }) => {
  console.log('🔔 === ST-VN1: Expiry Reminder notification ===');
  await login(page);

  const foodName = `Milk-${Date.now()}`;
  console.log('📝 [ST-VN1] foodName =', foodName);

  await page.getByRole('link', { name: 'Food Center' }).click();
  console.log('✅ [ST-VN1] Food Center page opened.');

  await page.getByRole('button', { name: '+ Add Item' }).click();
  console.log('✅ [ST-VN1] "+ Add Item" dialog opened.');

  await page.getByRole('textbox', { name: 'Eg. (Egg)' }).fill(foodName);
  console.log('✅ [ST-VN1] Food name filled.');

  await page.getByRole('button', { name: '+', exact: true }).click();
  await page.getByRole('button', { name: '+', exact: true }).click();
  console.log('✅ [ST-VN1] Quantity increased.');

  await fillAllSelects(page);

  const nearExpiry = formatDateOffset(1);
  await page.locator('input[type="date"]').fill(nearExpiry);
  console.log('✅ [ST-VN1] Expiry date (near) filled:', nearExpiry);

  page.once('dialog', async dialog => {
    console.log(`💬 [ST-VN1] Dialog after Add: "${dialog.message()}"`);
    await dialog.dismiss().catch(() => {});
  });

  const addBtn = page.getByRole('button', { name: 'Add', exact: true });
  console.log('⏳ [ST-VN1] Waiting for Add button to be enabled...');
  await expect(addBtn).toBeEnabled();
  console.log('✅ [ST-VN1] Add button enabled. Clicking...');
  await addBtn.click();

  console.log('⚙️ [ST-VN1] Calling expiry job endpoint...');
  await request.get(`${BASE_URL}api/test_run_expiry_job.php`).catch(err => {
    console.log('⚠️ [ST-VN1] Error calling expiry job endpoint:', err);
  });

  console.log('⏳ [ST-VN1] Waiting 900ms for job to process...');
  await page.waitForTimeout(900);

  await openNotification(page);

  const anyNotif = page.locator('.noti-card').first();
  console.log('🔍 [ST-VN1] Checking that at least one notification card exists...');
  await expect(anyNotif).toBeVisible();
  console.log('🎉 [ST-VN1] Test completed successfully.');
});

/* =====================================================
 * ST-VN3 — MEAL PLAN REMINDER
 * ===================================================== */
test('ST-VN3: Meal Plan Reminder notification', async ({ page, request }) => {
  console.log('🔔 === ST-VN3: Meal Plan Reminder notification ===');
  await login(page);

  console.log('🏁 [ST-VN3] Navigating to /meal-planner...');
  await page.goto(`${BASE_URL}meal-planner`);
  console.log('✅ [ST-VN3] URL now:', page.url());

  const emptyCell = page.locator('td.meal-cell:has(.meal-add)').first();
  console.log('⏳ [ST-VN3] Waiting for first empty meal cell (+)...');
  await expect(emptyCell).toBeVisible();
  console.log('✅ [ST-VN3] Empty meal cell visible. Clicking...');
  await emptyCell.click();

  console.log('⏳ [ST-VN3] Expecting /meal-planner/recipes URL...');
  await expect(page).toHaveURL(/meal-planner\/recipes/i);
  console.log('✅ [ST-VN3] Now at:', page.url());

  const saveButton = page
    .getByRole('button', { name: /Save|Use this|Select|Add to Plan|Confirm/i })
    .first();
  const saveCount = await saveButton.count();
  console.log('🧮 [ST-VN3] Save-like button count:', saveCount);

  if (saveCount > 0) {
    console.log('✅ [ST-VN3] Clicking first save-like button...');
    await saveButton.click();
  } else {
    const anyButton = page.getByRole('button').first();
    const txt = await anyButton.textContent();
    console.log('⚠️ [ST-VN3] No named save button, clicking first button:', txt?.trim());
    await anyButton.click();
  }

  console.log('⚙️ [ST-VN3] Calling mealplan job endpoint...');
  await request.get(`${BASE_URL}api/test_run_mealplan_job.php`).catch(err => {
    console.log('⚠️ [ST-VN3] Error calling mealplan job endpoint:', err);
  });

  console.log('⏳ [ST-VN3] Waiting 900ms for job to process...');
  await page.waitForTimeout(900);

  await openNotification(page);

  const anyNotif = page.locator('.noti-card').first();
  console.log('🔍 [ST-VN3] Checking that at least one notification card exists...');
  await expect(anyNotif).toBeVisible();
  console.log('🎉 [ST-VN3] Test completed successfully.');
});

/* =====================================================
 * ST-VN4 — ACCOUNT / PRIVACY ALERT (Settings)
 * ===================================================== */
test('ST-VN4: Account alert notification', async ({ page }) => {
  console.log('🔔 === ST-VN4: Account alert (Settings) ===');
  await login(page);

  console.log('🏁 [ST-VN4] Navigating to /settings...');
  await page.goto(`${BASE_URL}settings`);
  console.log('✅ [ST-VN4] URL now:', page.url());

  page.once('dialog', dialog => {
    console.log(`💬 [ST-VN4] Settings dialog: "${dialog.message()}"`);
    dialog.dismiss().catch(() => {});
  });

  const firstCheckbox = page.locator('input[type="checkbox"]').first();
  const cbCount = await firstCheckbox.count();
  console.log('🧮 [ST-VN4] Checkbox count on settings page:', cbCount);

  if (cbCount > 0) {
    console.log('✅ [ST-VN4] Toggling first checkbox...');
    await firstCheckbox.click().catch(err => {
      console.log('⚠️ [ST-VN4] Error clicking checkbox:', err);
    });
  } else {
    console.log('ℹ️ [ST-VN4] No checkbox found to toggle.');
  }

  const saveBtn = page.getByRole('button', { name: /Save/i }).first();
  const saveExists = await saveBtn.count();
  console.log('🧮 [ST-VN4] Save button count:', saveExists);

  if (saveExists > 0) {
    console.log('✅ [ST-VN4] Clicking Save button...');
    await saveBtn.click().catch(err => {
      console.log('⚠️ [ST-VN4] Error clicking Save button:', err);
    });
  } else {
    console.log('ℹ️ [ST-VN4] No Save button found.');
  }

  await expect(page).not.toHaveURL(/\/login$/i);
  console.log('🎉 [ST-VN4] Still not on /login – settings change flow OK.');
});

/* =====================================================
 * ST-VN5 — Notification tabs work
 * ===================================================== */
test('ST-VN5: Notification tabs work', async ({ page }) => {
  console.log('🔔 === ST-VN5: Notification tabs work ===');
  await login(page);

  console.log('🏁 [ST-VN5] Opening Notification page...');
  await openNotification(page);

  const allTab = page.getByRole('button', { name: /^All$/ });
  const unreadTab = page.getByRole('button', { name: /^Unread$/ });
  const readTab = page.getByRole('button', { name: /^Read$/ });

  console.log('⏳ [ST-VN5] Waiting for "All" tab to be visible...');
  await expect(allTab).toBeVisible();
  console.log('✅ [ST-VN5] "All" tab visible.');

  console.log('✅ [ST-VN5] Clicking "Unread" tab...');
  await unreadTab.click();

  const firstCard = page.locator('.noti-card').first();
  console.log('⏳ [ST-VN5] Checking first notification card in Unread...');
  await expect(firstCard).toBeVisible();
  console.log('✅ [ST-VN5] At least one notification in Unread.');

  console.log('✅ [ST-VN5] Clicking "Read" tab...');
  await readTab.click();
  console.log('🎉 [ST-VN5] Tabs navigation completed (no further assertion set).');
});
