// src/pages/demoNotifications.js
const now = Date.now();
const iso = (t) => new Date(t).toISOString().slice(0, 10); // YYYY-MM-DD

export const demoNotifications = [
  {
    id: 101,
    category: "Expiry",
    title: "Inventory Reminder",
    message: 'Item Pasta is expiring soon',
    createdAt: new Date(now - 26 * 60 * 60 * 1000).toISOString(),
    isRead: false,
    item: {
      name: "Pasta",
      quantity: 2,
      unit: "packs",
      unitID: 3,
      expiryISO: iso(now + 2 * 24 * 60 * 60 * 1000),
      storageLocation: "Dry Pantry – Top Shelf",
      categoryID: 7,
    },
  },
  {
    id: 102,
    category: "Inventory",
    title: "New Item Added",
    message: "You added a new food item.",
    createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
    isRead: true,
    item: {
      name: "Eggs",
      quantity: 12,
      unit: "pcs",
      unitID: 1,
      expiryISO: iso(now + 10 * 24 * 60 * 60 * 1000),
      storageLocation: "Fridge – Middle",
      categoryID: 2,
    },
  },
  {
    id: 103,
    category: "MealPlan",
    title: "Today’s Meal Plan",
    message: "You have a planned meal today.",
    createdAt: new Date(now - 30 * 60 * 1000).toISOString(),
    isRead: false,
    mealPlan: {
      dateISO: iso(now),
      planTitle: "Creamy Pasta with Eggs",
      notes: "Use up pasta and eggs.",
    },
    item: {
      name: "Pasta",
      quantity: 1,
      unit: "pack",
      expiryISO: iso(now + 2 * 24 * 60 * 60 * 1000),
      storageLocation: "Dry Pantry – Top Shelf",
    },
  },
  {
    id: 104,
    category: "Donation",
    title: "Donation Created",
    message: "Your donation was created successfully.",
    createdAt: new Date(now - 8 * 60 * 1000).toISOString(),
    isRead: true,
    item: {
      name: "Bread Loaf",
      quantity: 2,
      unit: "pcs",
      expiryISO: iso(now + 24 * 60 * 60 * 1000),
    },
    donation: {
      location: "Community Center, 12 Jalan Mawar, KL",
      slots: [
        { date: iso(now), from: "10:00", to: "11:00" },
        { date: iso(now + 24 * 60 * 60 * 1000), from: "15:00", to: "17:00" },
      ],
    },
  },
  {
    id: 105,
    category: "System",
    title: "Welcome to IYO Smart Pantry",
    message: "Your account was created successfully. Let’s get started!",
    createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
    isRead: true,
  },
  {
    id: 106,
    category: "Account",
    title: "Account Security Updated",
    message: "You made a change in Account Setting: 2FA Setting on",
    createdAt: new Date(now - 2 * 60 * 1000).toISOString(),
    isRead: false,
    account: { change: "2FA Setting on" },
  },
];

export function getNotificationById(id) {
  return demoNotifications.find((n) => String(n.id) === String(id)) || null;
}
