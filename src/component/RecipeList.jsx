import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CookPopup from "../component/CookPopup";
import { saveMealEntry } from "../../api/services/MealPlanService"; // ✅ added
import "./RecipeList.css";

export default function RecipeList() {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Get day/type/weekOffset sent from MealPlanner.jsx
  const { day, type, weekOffset } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [genericRecipes, setGenericRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  // ✅ Map meal types: breakfast → MT1, lunch → MT2, dinner → MT3, snack → MT4
  const mealTypeMap = {
    breakfast: "MT1",
    lunch: "MT2",
    dinner: "MT3",
    snack: "MT4",
  };


  useEffect(() => {
    async function fetchRecipes() {
      try {
        const res = await fetch(
          "http://localhost/IYO_Smart_Pantry/api/recipes/list.php"
        );
        const data = await res.json();

        if (!data.ok) throw new Error("API failed.");

        setSuggestedRecipes(data.recipes.filter(r => Number(r.isGeneric) === 0));
        setGenericRecipes(data.recipes.filter(r => Number(r.isGeneric) === 1));
      } catch (err) {
        console.error("❌ Error loading recipes:", err);
      }

      setLoading(false);
    }

    fetchRecipes();
  }, []);

  // ✅ Load details on Cook
  const handleCook = async (recipe) => {
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

  // ✅ Convert MON/TUE/WED... to actual YYYY-MM-DD
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

    return result.toISOString().substring(0, 10); // YYYY-MM-DD
  }

  // ✅ Load details on Cook
  const handleConfirm = async (recipe) => {
    const { day, type, weekOffset } = location.state; // ✅ get from router
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
        refreshDate: mealDate   // ✅ send to planner
      }
    });
  };


  // ✅ Compute YYYY-MM-DD Monday again
  function getStartOfWeek(offset) {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);
    return monday;
  }

  function getWeekStartString(offset) {
    return getStartOfWeek(offset).toISOString().split("T")[0];
  }

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
            {/* ✅ Suggested */}
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

                      {/* ✅ UI unchanged */}
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

            {/* ✅ Generic */}
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
          </>
        )}

        {selectedRecipe && (
          <CookPopup
            recipe={selectedRecipe}
            onClose={() => setSelectedRecipe(null)}
            onConfirm={handleConfirm}
          />
        )}
      </div>
    </div>
  );
}
