// src/api/services/MealPlanService.js

// Define base API URL
const API_BASE = "http://localhost/IYO_Smart_Pantry/api";

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'API request failed');
  }
  return response.json();
};

// Load week's meal plan
export async function loadWeek({ userID, weekStart }) {
  try {
    const response = await fetch(`${API_BASE}/mealplan/load.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userID, weekStart }),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error loading week:", error);
    return { ok: false, error: error.message };
  }
}

// Save a new meal entry
export async function saveMealEntry(entry) {
  try {
    const response = await fetch(`${API_BASE}/mealplan/save.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error saving meal entry:", error);
    return { ok: false, error: error.message };
  }
}

// Assign recipe to existing meal
export async function assignRecipeToMeal(mealEntryId, recipeId, userId) {
  try {
    const response = await fetch(`${API_BASE}/mealplan/assign_recipe.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealEntryId,
        recipeId,
        userId
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error assigning recipe to meal:", error);
    return { ok: false, error: error.message };
  }
}

// Mark meal as done - moves reserved quantities to used
export async function markMealAsDone(mealEntryId, userId) {
  try {
    const response = await fetch(`${API_BASE}/meal_actions/markAsDone.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealEntryID: mealEntryId, // Standardized to mealEntryID to match backend
        userID: userId // Added userID parameter
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error marking meal as done:", error);
    return { ok: false, error: error.message };
  }
}

// Delete meal - returns reserved quantities to available
export async function deleteMeal(mealEntryId, userId) {
  try {
    const response = await fetch(`${API_BASE}/meal_actions/deleteMeal.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealEntryID: mealEntryId, // Standardized to mealEntryID to match backend
        userID: userId // Added userID parameter
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error deleting meal:", error);
    return { ok: false, error: error.message };
  }
}

// Replan meal - cancels old reservations and creates new ones
export async function replanMeal(mealEntryId, newRecipeId, userId) {
  try {
    const response = await fetch(`${API_BASE}/meal_actions/replanMeal.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealEntryID: mealEntryId, // Standardized to mealEntryID to match backend
        newRecipeID: newRecipeId, // Standardized to newRecipeID to match backend
        userID: userId // Added userID parameter
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error replanning meal:", error);
    return { ok: false, error: error.message };
  }
}

// NEW: Function to get meal details including ingredient information
export async function getMealDetails(mealEntryId, userId) {
  try {
    const response = await fetch(`${API_BASE}/mealplan/getMealDetails.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        mealEntryID: mealEntryId,
        userID: userId
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error getting meal details:", error);
    return { ok: false, error: error.message };
  }
}

// NEW: Function to check ingredient availability before planning
export async function checkIngredientAvailability(recipeId, userId) {
  try {
    const response = await fetch(`${API_BASE}/mealplan/checkIngredients.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recipeID: recipeId,
        userID: userId
      })
    });

    return handleResponse(response);
  } catch (error) {
    console.error("Error checking ingredient availability:", error);
    return { ok: false, error: error.message };
  }
}