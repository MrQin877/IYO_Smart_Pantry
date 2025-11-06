// src/component/CookPopup.jsx
import React from "react";
import "./CookPopup.css";

export default function CookPopup({ recipe, onClose, onConfirm }) {
  if (!recipe) return null;

  const recipeName = recipe.recipeName || recipe.name;
  const ingredientList = recipe.ingredients || [];

  return (
    <div className="cook-overlay">
      <div className="cook-card">
        <button className="cook-close" onClick={onClose}>✕</button>

        <h3 className="cook-title">Meal Plan</h3>

        <div className="cook-body">
          <p><strong>Item name:</strong> {recipeName}</p>

          <div className="cook-ingredients">
            <p className="ing-title"><strong>Ingredients needed:</strong></p>

            {ingredientList.length === 0 ? (
              <p className="ing-row">No ingredients listed</p>
            ) : (
              ingredientList.map((ing, i) => (
                <p key={i} className="ing-row">
                  {ing.ingredientName || ing.name}{" "}
                  {ing.ingredientQty ? `(${ing.ingredientQty})` : ""}
                </p>
              ))
            )}
          </div>
        </div>

        <button
          className="cook-ok"
          onClick={() => {
            onConfirm(recipe);
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
