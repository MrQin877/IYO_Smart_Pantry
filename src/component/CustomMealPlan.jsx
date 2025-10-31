import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IngredientPopup from "./IngredientPopup";
import "./CustomMealPlan.css";

export default function CustomMealPlan() {
  const navigate = useNavigate();

  const [mealName, setMealName] = useState("");
  const [notes, setNotes] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState([]);

  // popup control
  const [showPopup, setShowPopup] = useState(false);

  // sample inventory items
  const [inventoryItems] = useState([
    { name: "Tomato", qty: 5, unit: "pcs" },
    { name: "Egg", qty: 12, unit: "pcs" },
    { name: "Garlic", qty: 100, unit: "g" },
    { name: "Rice", qty: 1, unit: "kg" },
    { name: "Chicken Breast", qty: 500, unit: "g" },
    { name: "Milk", qty: 1, unit: "L" },
  ]);

  // handle ingredient selection from popup
  const handleAddIngredients = (selectedIngredients) => {
    setIngredients((prev) => [
      ...prev,
      ...selectedIngredients.filter(
        (sel) => !prev.some((p) => p.name === sel.name)
      ),
    ]);
  };

  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    const customMeal = {
      mealName,
      notes,
      servings,
      ingredients: ingredients.filter((i) => i.name.trim() !== ""),
    };

    const existingMeals = JSON.parse(localStorage.getItem("customMeals")) || [];
    localStorage.setItem(
      "customMeals",
      JSON.stringify([...existingMeals, customMeal])
    );

    alert("Custom meal saved!");
    navigate(-1);
  };

  return (
    <div className="custom-meal-container">
      <div className="custom-meal-card">
        {/* Header */}
        <div className="custom-header">
          <button className="back-btn" onClick={() => navigate(-1)}>
            <ArrowLeft size={22} />
          </button>
          <h2>Custom Meal Plan</h2>
        </div>

        {/* Meal Info */}
        <div className="form-section">
          <div className="form-row">
            <label>Meal Name:</label>
            <input
              type="text"
              value={mealName}
              onChange={(e) => setMealName(e.target.value)}
              placeholder="Enter meal name"
            />
          </div>

          <div className="form-row notes-row">
            <label>Notes:</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter notes"
            />
          </div>

          <div className="form-row servings-row">
            <label>Servings:</label>
            <input
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g. 5"
            />
          </div>
        </div>

        {/* Ingredients Section */}
        <div className="ingredients-section">
          <div className="ingredients-header">
            <h3>Ingredients</h3>
            <button className="add-btn" onClick={() => setShowPopup(true)}>
              <Plus size={18} /> Add Ingredient
            </button>
          </div>

          <div className="ingredient-list">
            {ingredients.length === 0 && (
              <p className="no-ingredient">No ingredients added yet.</p>
            )}
            {ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  value={`${ingredient.name} (${ingredient.qty}${ingredient.unit || ""})`}
                  readOnly
                />
                <button
                  className="remove-btn"
                  onClick={() => handleRemoveIngredient(index)}
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div className="save-section">
          <button className="save-btn" onClick={handleSave}>
            Save Meal
          </button>
        </div>
      </div>

      {/* Ingredient Popup */}
      {showPopup && (
        <IngredientPopup
          inventory={inventoryItems}
          onClose={() => setShowPopup(false)}
          onAdd={handleAddIngredients}
        />
      )}
    </div>
  );
}
