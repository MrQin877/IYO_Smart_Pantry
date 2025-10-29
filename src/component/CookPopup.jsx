// src/component/CookPopup.jsx
import React from "react";
import "./CookPopup.css";

export default function CookPopup({ recipe, onClose, onConfirm }) {
  if (!recipe) return null;

  return (
    <div className="cook-overlay">
      <div className="cook-card">
        <button className="cook-close" onClick={onClose}>✕</button>

        <div className="cook-thumb" aria-hidden />
        <h3 className="cook-title">Meal Plan</h3>

        <div className="cook-body">
          <p><strong>Item name:</strong> {recipe.name}</p>

          <div className="cook-ingredients">
            <p className="ing-title"><strong>Ingredient needed:</strong></p>
            {recipe.ingredients.map((ing, i) => (
              <p key={i} className="ing-row">
                {ing.name} {ing.quantity ? ` ${ing.quantity}` : ""}
              </p>
            ))}
          </div>
        </div>

        <button
          className="cook-ok"
          onClick={() => {
            onConfirm(recipe);
            onClose();
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}
