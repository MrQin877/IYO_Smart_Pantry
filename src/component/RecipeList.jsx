// src/pages/RecipeList.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CookPopup from "../component/CookPopup";
import { saveMealEntry } from "../../api/services/MealPlanService";
import "./RecipeList.css";

export default function RecipeList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get day/type/weekOffset sent from MealPlanner.jsx
  const { day, type, weekOffset } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [genericRecipes, setGenericRecipes] = useState([]);
  const [savedCustomMeals, setSavedCustomMeals] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [showSuggestedSection, setShowSuggestedSection] = useState(false);

  // Map meal types: breakfast → MT1, lunch → MT2, dinner → MT3, snack → MT4
  const mealTypeMap = {
    breakfast: "MT1",
    lunch: "MT2",
    dinner: "MT3",
    snack: "MT4",
  };

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch user's inventory
        const inventoryRes = await fetch(
          "http://localhost/IYO_Smart_Pantry/api/inventory/list.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ userID: "U2" }) // Using hardcoded user ID for now
          }
        );
        const inventoryData = await inventoryRes.json();
        
        if (inventoryData.ok) {
          // Log inventory items for debugging
          console.log("Inventory items:");
          inventoryData.inventory.forEach(item => {
            console.log(`${item.foodName}: ${item.quantity} ${item.unit}`);
          });
          
          // Prioritize inventory items (already sorted by is_plan and expiryDate in the query)
          setInventory(inventoryData.inventory);
        }

        // Fetch recipes
        const recipesRes = await fetch(
          "http://localhost/IYO_Smart_Pantry/api/recipes/list.php"
        );
        const recipesData = await recipesRes.json();

        if (!recipesData.ok) throw new Error("API failed.");

        // Process recipes based on inventory
        if (inventoryData.ok) {
          processRecipes(recipesData.recipes, inventoryData.inventory);
        } else {
          // If no inventory, just categorize recipes
          setSuggestedRecipes([]);
          setGenericRecipes(recipesData.recipes.filter(r => Number(r.isGeneric) === 1));
          setSavedCustomMeals(
            recipesData.recipes.filter(r => Number(r.isGeneric) === 0 && r.recipeID.startsWith("R"))
          );
        }
      } catch (err) {
        console.error("❌ Error loading data:", err);
      }

      setLoading(false);
    }

    fetchData();
  }, []);

  // Function to process recipes based on inventory
  const processRecipes = async (recipes, inventory) => {
    // Get detailed ingredient information for all recipes
    const recipesWithIngredients = await Promise.all(
      recipes.map(async (recipe) => {
        try {
          const res = await fetch(
            "http://localhost/IYO_Smart_Pantry/api/recipes/details.php",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ recipeID: recipe.recipeID }),
            }
          );

          const data = await res.json();
          
          if (data.ok) {
            return {
              ...recipe,
              ingredients: data.recipe.ingredients || [],
            };
          }
          return recipe;
        } catch (err) {
          console.error("❌ Error loading recipe details:", err);
          return recipe;
        }
      })
    );

    // Filter suggested recipes based on inventory
    const suggested = recipesWithIngredients.filter(r => {
      // Check if all ingredients for this recipe are in the inventory
      if (!r.ingredients || r.ingredients.length === 0) {
        console.log(`Recipe ${r.recipeName} has no ingredients`);
        return false;
      }
      
      const hasAllIngredients = r.ingredients.every(ingredient => {
        // Match by ingredient name instead of ID
        const hasIngredient = inventory.some(item => 
          item.foodName.toLowerCase() === ingredient.ingredientName.toLowerCase() && 
          Number(item.quantity) >= Number(ingredient.quantityNeeded)
        );
        
        if (!hasIngredient) {
          console.log(`Missing ingredient for ${r.recipeName}: ${ingredient.ingredientName}, needed: ${ingredient.quantityNeeded}`);
          // Check if we have the ingredient but not enough quantity
          const hasIngredientButNotEnough = inventory.some(item => 
            item.foodName.toLowerCase() === ingredient.ingredientName.toLowerCase()
          );
          if (hasIngredientButNotEnough) {
            const inventoryItem = inventory.find(item => 
              item.foodName.toLowerCase() === ingredient.ingredientName.toLowerCase()
            );
            console.log(`Have ${inventoryItem.quantity} of ${ingredient.ingredientName}, but need ${ingredient.quantityNeeded}`);
          }
        }
        
        return hasIngredient;
      });
      
      if (hasAllIngredients) {
        console.log(`Recipe ${r.recipeName} can be made with available ingredients`);
      }
      
      return hasAllIngredients;
    });
    
    console.log("Suggested recipes:", suggested);
    setSuggestedRecipes(suggested);
    setShowSuggestedSection(suggested.length > 0);
    
    // Set generic recipes
    setGenericRecipes(recipesWithIngredients.filter(r => Number(r.isGeneric) === 1));
    
    // Set saved custom meals (user-created non-generic)
    setSavedCustomMeals(
      recipesWithIngredients.filter(r => Number(r.isGeneric) === 0 && r.recipeID.startsWith("R"))
    );
  };

  // Load details on Cook
  const handleCook = async (recipe) => {
    try {
      // If recipe already has ingredients, use them
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        setSelectedRecipe(recipe);
        return;
      }

      // Otherwise fetch details
      const res = await fetch(
        "http://localhost/IYO_Smart_Pantry/api/recipes/details.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipeID: recipe.recipeID }),
        }
      );

      const data = await res.json();

      if (!data.ok) {
        alert("Failed to load recipe details.");
        return;
      }

      setSelectedRecipe({
        ...recipe,
        ingredients: data.recipe.ingredients || [],
      });
    } catch (err) {
      console.error("❌ Error loading recipe details:", err);
    }
  };

  // =================================================================
  // ✅ FIX: Helper to get YYYY-MM-DD in LOCAL timezone
  // =================================================================
  function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Convert MON/TUE/WED... to actual YYYY-MM-DD
  function getDateForDay(weekOffset, day) {
    const dayIndex = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"].indexOf(day);
    if (dayIndex < 0) return null;

    const now = new Date();
    const currentDay = now.getDay(); // 0 = Sun
    const diffToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    // Monday of current week
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday + weekOffset * 7);

    const result = new Date(monday);
    result.setDate(monday.getDate() + dayIndex);

    // ✅ FIX: Use the local date string helper
    return toLocalDateString(result);
  }

  // Load details on Cook
  const handleConfirm = async (recipe) => {
    const { day, type, weekOffset } = location.state;
    const mealTypeID = mealTypeMap[type];

    if (!mealTypeID) {
      console.error("❌ Invalid meal type:", type);
      return;
    }

    const mealDate = getDateForDay(weekOffset, day);

    const payload = {
      userID: "U2",
      recipeID: recipe.recipeID,
      mealName: recipe.recipeName,
      mealTypeID,
      mealDate,
    };

    console.log("📤 Sending to backend:", payload);

    const res = await saveMealEntry(payload);
    console.log("✅ Save result:", res);
    navigate("/meal-planner", {
      state: {
        refreshDate: mealDate,
      },
    });
  };

  return (
    <div className="recipe-page">
      <div className="recipe-container">
        <div className="recipe-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>
            <h2>Recipe Suggestions</h2>
          </div>

          <button className="custom-btn" onClick={() => navigate("/custom-meal")}>
            <Plus size={18} />
            Custom
          </button>
        </div>

        {loading ? (
          <p>Loading recipes...</p>
        ) : (
          <>
            {/* Suggested Recipes - Only show if there are matching recipes */}
            {showSuggestedSection && (
              <div className="recipe-section">
                <h3 className="section-title">Suggested Recipes</h3>
                <div className="recipe-grid">
                  {suggestedRecipes.map((r) => (
                    <div key={r.recipeID} className="recipe-card">
                      <img
                        src={r.image || "/default-food.png"}
                        alt={r.recipeName}
                        className="recipe-img"
                      />

                      <div className="recipe-info">
                        <h3>{r.recipeName}</h3>
                        <p className="ingredients">
                          {r.ingredientNames || "Ingredients Loaded on Cook"}
                        </p>
                        <button className="cook-btn" onClick={() => handleCook(r)}>
                          Cook
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Generic Recipes */}
            <div className="recipe-section">
              <h3 className="section-title">Generic Recipes</h3>
              <div className="recipe-grid">
                {genericRecipes.map((r) => (
                  <div key={r.recipeID} className="recipe-card">
                    <img
                      src={r.image || "/default-food.png"}
                      alt={r.recipeName}
                      className="recipe-img"
                    />

                    <div className="recipe-info">
                      <h3>{r.recipeName}</h3>
                      <p className="ingredients">
                        {r.ingredientNames || "Ingredients Loaded on Cook"}
                      </p>
                      <button className="cook-btn" onClick={() => handleCook(r)}>
                        Cook
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Custom Meals */}
            <div className="recipe-section">
              <h3 className="section-title">My Saved Custom Meals</h3>
              {savedCustomMeals.length === 0 ? (
                <div className="no-custom-meals">
                  <p>Add one custom meal now!</p>
                  <button className="add-custom-btn" onClick={() => navigate("/custom-meal")}>
                    <Plus size={18} />
                    Add Custom Meal
                  </button>
                </div>
              ) : (
                <div className="recipe-grid">
                  {savedCustomMeals.map((r) => (
                    <div key={r.recipeID} className="recipe-card">
                      <img
                        src={r.image || "/default-food.png"}
                        alt={r.recipeName}
                        className="recipe-img"
                      />

                      <div className="recipe-info">
                        <h3>{r.recipeName}</h3>
                        <p className="ingredients">
                          {r.ingredientNames || "Ingredients Loaded on Cook"}
                        </p>
                        <button className="cook-btn" onClick={() => handleCook(r)}>
                          Cook
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}



        {selectedRecipe && (
          <CookPopup
            recipe={selectedRecipe}
            inventory={inventory}
            isSuggested={suggestedRecipes.some(r => r.recipeID === selectedRecipe.recipeID)} // ✅ Check if recipe is in suggested list
            onClose={() => setSelectedRecipe(null)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}