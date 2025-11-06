const API_BASE = "http://localhost/IYO_Smart_Pantry/api/recipes";

export async function getAllRecipes() {
  const res = await fetch(`${API_BASE}/list.php`);
  return res.json();
}

export async function getRecipeDetails(recipeID) {
  const res = await fetch(`${API_BASE}/details.php`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ recipeID })
  });
  return res.json();
}
