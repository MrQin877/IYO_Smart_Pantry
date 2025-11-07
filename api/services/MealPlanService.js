// /src/api/services/MealPlanService.js

const API = "http://localhost/IYO_Smart_Pantry/api/mealplan";

export async function loadWeek({ userID, weekStart }) {
  const res = await fetch("http://localhost/IYO_Smart_Pantry/api/mealplan/load.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userID, weekStart }),
  });

  return res.json();
}


export async function saveMealEntry(entry) {
  const res = await fetch(`${API}/save.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(entry),
  });

  return res.json();
}
