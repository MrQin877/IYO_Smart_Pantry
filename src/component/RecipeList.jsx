// src/pages/RecipeList.jsx
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import CookPopup from "../component/CookPopup";
import { saveMealEntry, assignRecipeToMeal, replanMeal } from "../../api/services/MealPlanService";
import "./RecipeList.css";

export default function RecipeList() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user ID from localStorage or use default for development
  const [userID] = useState(() => {
    return localStorage.getItem('userID') || 'U2';
  });

  // Get day/type/weekOffset sent from MealPlanner.jsx
  const { day, type, weekOffset, isReplan, mealEntryID } = location.state || {};

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

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      const inventoryRes = await fetch(
        "http://localhost/IYO_Smart_Pantry/api/inventory/list.php",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userID })
        }
      );
      const inventoryData = await inventoryRes.json();
      
      if (inventoryData.ok) {
        setInventory(inventoryData.inventory || []);
        return inventoryData.inventory || [];
      }
      return [];
    } catch (err) {
      console.error("❌ Error fetching inventory:", err);
      return [];
    }
  }, [userID]);

  // Fetch recipes data
  const fetchRecipes = useCallback(async () => {
    try {
      const recipesRes = await fetch(
        "http://localhost/IYO_Smart_Pantry/api/recipes/list.php"
      );
      const recipesData = await recipesRes.json();

      if (!recipesData.ok) throw new Error("API failed.");

      return recipesData.recipes || [];
    } catch (err) {
      console.error("❌ Error fetching recipes:", err);
      return [];
    }
  }, []);

  // Function to process recipes based on inventory
  const processRecipes = useCallback(async (recipes, inventory) => {
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

    // Filter suggested recipes based on available inventory (not reserved)
    const suggested = recipesWithIngredients.filter(r => {
      if (!r.ingredients || r.ingredients.length === 0) {
        return false;
      }
      
      const hasAllIngredients = r.ingredients.every(ingredient => {
        // Match by ingredient name
        const inventoryItem = inventory.find(item => 
          item.foodName.toLowerCase() === ingredient.ingredientName.toLowerCase()
        );
        
        if (!inventoryItem) return false;
        
        // Check if we have enough available quantity (total - reserved)
        const availableQuantity = Number(inventoryItem.quantity) ;
        return availableQuantity >= Number(ingredient.quantityNeeded);
      });
      
      return hasAllIngredients;
    });
    
    setSuggestedRecipes(suggested);
    setShowSuggestedSection(suggested.length > 0);
    
    // Set generic recipes
    setGenericRecipes(recipesWithIngredients.filter(r => Number(r.isGeneric) === 1));
    
    // Set saved custom meals (user-created non-generic)
    setSavedCustomMeals(
      recipesWithIngredients.filter(r => Number(r.isGeneric) === 0 && r.recipeID.startsWith("R"))
    );
  }, []);

  // Initialize data
  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [inventoryData, recipesData] = await Promise.all([
          fetchInventory(),
          fetchRecipes()
        ]);
        
        if (inventoryData.length > 0) {
          processRecipes(recipesData, inventoryData);
        } else {
          // If no inventory, just categorize recipes
          setSuggestedRecipes([]);
          setShowSuggestedSection(false);
          setGenericRecipes(recipesData.filter(r => Number(r.isGeneric) === 1));
          setSavedCustomMeals(
            recipesData.filter(r => Number(r.isGeneric) === 0 && r.recipeID.startsWith("R"))
          );
        }
      } catch (err) {
        console.error("❌ Error loading data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [fetchInventory, fetchRecipes, processRecipes]);

  // Load details on Cook
  const handleCook = useCallback(async (recipe) => {
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
  }, []);

  // Helper to get YYYY-MM-DD in LOCAL timezone
  const toLocalDateString = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  // Convert MON/TUE/WED... to actual YYYY-MM-DD
  const getDateForDay = useCallback((weekOffset, day) => {
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

    return toLocalDateString(result);
  }, [toLocalDateString]);

  // Updated handleConfirm function with better error handling
  const handleConfirm = useCallback(async (recipe) => {
    const { day, type, weekOffset, isReplan, mealEntryID } = location.state || {};
    const mealTypeID = mealTypeMap[type];

    if (!mealTypeID) {
      console.error("❌ Invalid meal type:", type);
      return;
    }

    const mealDate = getDateForDay(weekOffset, day);

    try {
      let result;
      
      if (isReplan && mealEntryID) {
        // For replanning, use the replanMeal function
        result = await replanMeal(mealEntryID, recipe.recipeID, userID);
        
        if (result.ok) {
          alert('Meal replanned successfully!');
          
          // Navigate back to meal planner with refresh
          navigate("/meal-planner", {
            state: {
              refreshDate: mealDate,
            },
          });
        } else {
          alert(result.error || 'Failed to replan meal');
        }
      } else {
        // For new meals, save the entry first
        const payload = {
          userID,
          recipeID: recipe.recipeID,
          mealName: recipe.recipeName,
          mealTypeID,
          mealDate,
        };

        console.log("📤 Sending to backend:", payload);

        const saveResult = await saveMealEntry(payload);
        console.log("✅ Save result:", saveResult);
        
        if (!saveResult.ok || !saveResult.entry) {
          throw new Error(saveResult.error || 'Failed to save meal');
        }
        
        // Then assign the recipe
        const assignResult = await assignRecipeToMeal(
          saveResult.entry.mealEntryID,
          recipe.recipeID,
          userID
        );
        
        console.log("✅ Recipe assignment result:", assignResult);
        
        if (!assignResult.ok) {
          throw new Error(assignResult.error || 'Failed to assign recipe');
        }
        
        alert('Meal saved and ingredients reserved successfully!');
        
        // Navigate back to meal planner with refresh
        navigate("/meal-planner", {
          state: {
            refreshDate: mealDate,
          },
        });
      }
    } catch (error) {
      console.error("❌ Error:", error);
      alert(error.message || 'An error occurred while saving meal');
    }
  }, [location.state, navigate, getDateForDay]);
  return (
    <div className="recipe-page">
      <div className="recipe-container">
        <div className="recipe-header">
          <div className="header-left">
            <button className="back-btn" onClick={() => navigate(-1)}>
              <ArrowLeft size={22} />
            </button>
            <h2>{isReplan ? 'Replan Meal' : 'Recipe Suggestions'}</h2>
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
            isSuggested={suggestedRecipes.some(r => r.recipeID === selectedRecipe.recipeID)}
            onClose={() => setSelectedRecipe(null)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}