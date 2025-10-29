import { useNavigate } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useState } from "react";
import CookPopup from "../component/CookPopup";
import "./RecipeList.css";

export default function RecipeList() {
  const navigate = useNavigate();

  // State to track selected recipe for popup
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Suggested Recipes
  const suggestedRecipes = [
    {
      name: "Tomato Egg Stir-Fry",
      ingredients: [
        { name: "Tomato", quantity: "2 pcs" },
        { name: "Egg", quantity: "2 pcs" },
        { name: "Salt", quantity: "1 tsp" },
      ],
      calories: "250 kcal",
      time: "10 min",
      image:
        "https://images.unsplash.com/photo-1601050690597-0d8b06e9e25c?w=400",
    },
    {
      name: "Garlic Fried Rice",
      ingredients: [
        { name: "Rice", quantity: "1 bowl" },
        { name: "Garlic", quantity: "3 cloves" },
        { name: "Soy Sauce", quantity: "1 tbsp" },
      ],
      calories: "400 kcal",
      time: "20 min",
      image:
        "https://images.unsplash.com/photo-1576402187877-36bbf1e42a59?w=400",
    },
  ];

  // Generic Recipes
  const genericRecipes = [
    {
      name: "Chicken Salad",
      ingredients: [
        { name: "Chicken", quantity: "100g" },
        { name: "Lettuce", quantity: "2 leaves" },
        { name: "Tomato", quantity: "1 pc" },
      ],
      calories: "320 kcal",
      time: "15 min",
      image:
        "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=400",
    },
    {
      name: "Beef Stir Fry",
      ingredients: [
        { name: "Beef", quantity: "150g" },
        { name: "Broccoli", quantity: "3 pcs" },
        { name: "Garlic", quantity: "2 cloves" },
      ],
      calories: "420 kcal",
      time: "25 min",
      image:
        "https://images.unsplash.com/photo-1606755962773-0e7264a3d5a9?w=400",
    },
    {
      name: "Vegetable Soup",
      ingredients: [
        { name: "Carrot", quantity: "1 pc" },
        { name: "Potato", quantity: "1 pc" },
        { name: "Celery", quantity: "1 stalk" },
      ],
      calories: "190 kcal",
      time: "30 min",
      image:
        "https://images.unsplash.com/photo-1617196034890-8a96c160b1f7?w=400",
    },
  ];

  // When user clicks "Cook"
  const handleCook = (recipe) => {
    setSelectedRecipe(recipe);
  };

  // When user clicks OK in popup
  const handleConfirm = (recipe) => {
    console.log("✅ Added to meal plan:", recipe.name);
    // You can later integrate saving to backend or state
  };

  return (
    <div className="recipe-page">
      {/* Header */}
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

      {/* Suggested Recipes */}
      <div className="recipe-section">
        <h3 className="section-title">Suggested Recipes</h3>
        <div className="recipe-grid">
          {suggestedRecipes.map((r, i) => (
            <div key={i} className="recipe-card">
              <img src={r.image} alt={r.name} className="recipe-img" />
              <div className="recipe-info">
                <h3>{r.name}</h3>
                <p className="ingredients">
                  {r.ingredients.map((ing) => ing.name).join(", ")}
                </p>
                <div className="details">
                  <span className="time">{r.time}</span>
                  <span className="calories">{r.calories}</span>
                </div>
                <button className="cook-btn" onClick={() => handleCook(r)}>
                  Cook
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generic Recipes */}
      <div className="recipe-section">
        <h3 className="section-title">Generic Recipes</h3>
        <div className="recipe-grid">
          {genericRecipes.map((r, i) => (
            <div key={i} className="recipe-card">
              <img src={r.image} alt={r.name} className="recipe-img" />
              <div className="recipe-info">
                <h3>{r.name}</h3>
                <p className="ingredients">
                  {r.ingredients.map((ing) => ing.name).join(", ")}
                </p>
                <div className="details">
                  <span className="time">{r.time}</span>
                  <span className="calories">{r.calories}</span>
                </div>
                <button className="cook-btn" onClick={() => handleCook(r)}>
                  Cook
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cook Popup */}
      {selectedRecipe && (
        <CookPopup
          recipe={selectedRecipe}
          onClose={() => setSelectedRecipe(null)}
          onConfirm={handleConfirm}
        />
      )}
    </div>
  );
}
