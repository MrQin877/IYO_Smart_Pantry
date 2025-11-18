import { useState } from "react";
import { ArrowLeft, Plus, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import IngredientPopup from "./IngredientPopup";
import { apiPost } from "../lib/api"; // adjust relative path if needed
import "./CustomMealPlan.css";

export default function CustomMealPlan() {
  const navigate = useNavigate();

  const [mealName, setMealName] = useState("");
  const [notes, setNotes] = useState("");
  const [servings, setServings] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // Popup control
  const [showPopup, setShowPopup] = useState(false);

  // Add selected ingredients from popup
  const handleAddIngredients = (selectedIngredients) => {
    setIngredients((prev) => [
      ...prev,
      ...selectedIngredients.filter(
        (sel) => !prev.some((p) => p.name === sel.name)
      ),
    ]);
  };

  // Remove ingredient from list
  const handleRemoveIngredient = (index) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  // Save custom meal plan to backend
// In CustomMealPlan.jsx

  const handleSave = async () => {
    // Clear previous message
    setMessage("");

    // Client-side validation
    if (!mealName.trim()) {
      const msg = "Meal name is required.";
      alert(msg);
      return;
    }

    if (!ingredients || ingredients.length === 0) {
      const msg = "Please add at least one ingredient to save the meal.";
      alert(msg);
      return;
    }

    try {
      setLoading(true);

      const response = await apiPost("/save_custom_meal.php", {
        mealName,
        notes,
        servings,
        ingredients,
        userID: "",
      });

      // Check if the backend itself reported an error
      if (response.success === false) {
        throw new Error(response.message || "Unknown server error");
      }

      alert("Custom meal saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error saving meal:", err);
      const errMsg = err.message || 'Failed to save custom meal';
      setMessage(errMsg);
      alert("Failed to save custom meal: " + errMsg);
    } finally {
      setLoading(false);
    }
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
              placeholder="Enter notes or instructions"
            />
          </div>

          <div className="form-row servings-row">
            <label>Servings:</label>
            <input
              type="number"
              min="1"
              value={servings}
              onChange={(e) => setServings(e.target.value)}
              placeholder="e.g. 2"
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

        {/* Save Section */}
        <div className="save-section">
          <button
            className="save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Meal"}
          </button>
          {message && <p className="error-text">{message}</p>}
        </div>
      </div>

      {/* Ingredient Popup */}
      {showPopup && (
        <IngredientPopup
          onClose={() => setShowPopup(false)}
          onAdd={handleAddIngredients}
        />
      )}
    </div>
  );
}
