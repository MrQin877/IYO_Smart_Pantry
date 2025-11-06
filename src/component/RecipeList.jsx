import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import CookPopup from "../component/CookPopup";
import "./RecipeList.css";

export default function RecipeList() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);

  const [suggestedRecipes, setSuggestedRecipes] = useState([]);
  const [genericRecipes, setGenericRecipes] = useState([]);

  const [selectedRecipe, setSelectedRecipe] = useState(null);

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

      // ✅ FIXED
      setSelectedRecipe({
        ...recipe,
        ingredients: data.recipe.ingredients || [],

      });
    } catch (err) {
      console.error("❌ Error loading recipe details:", err);
    }
  };

  const handleConfirm = (recipe) => {
    console.log("✅ Add to Meal Planner:", recipe.recipeName);
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

            {/* ✅ Generic Recipes */}
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
