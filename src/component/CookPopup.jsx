// src/component/CookPopup.jsx
import React from "react";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import "./CookPopup.css";

export default function CookPopup({ recipe, onClose, onConfirm, inventory, isSuggested }) {
  if (!recipe) return null;

  const recipeName = recipe.recipeName || recipe.name;
  const ingredientList = recipe.ingredients || [];
  const instructionText = recipe.instruction || recipe.notes || "No instructions provided.";

  // Function to check if an item is expiring soon (within 3 days)
  const isExpiringSoon = (expiryDate) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  // Function to get days until expiry
  const getDaysUntilExpiry = (expiryDate) => {
    if (!expiryDate) return null;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Function to get inventory item for an ingredient
  const getInventoryItem = (ingredientName) => {
    return inventory.find(item => 
      item.foodName.toLowerCase() === ingredientName.toLowerCase()
    );
  };

  return (
    <div className="cook-overlay">
      <div className="cook-card">
        <button className="cook-close" onClick={onClose}>✕</button>

        <h3 className="cook-title">Meal Plan</h3>

        <div className="cook-body">
          {/* ✅ Name */}
          <p className="ing-title"><strong>Item name:</strong></p> 
          <p>{recipeName}</p>

          {/* ✅ NEW: Instructions Section */}
          <div className="cook-instructions">
            <p className="ing-title"><strong>Instructions:</strong></p>

            <p className="instruction-text">
              {instructionText}
            </p>
          </div>

          {/* ✅ Ingredients with Priority Indicators */}
          <div className="cook-ingredients">
            <p className="ing-title"><strong>Ingredients needed:</strong></p>

            {ingredientList.length === 0 ? (
              <p className="ing-row">No ingredients listed</p>
            ) : (
              ingredientList.map((ing, i) => {
                const inventoryItem = getInventoryItem(ing.ingredientName || ing.name);
                const isPlanned = inventoryItem && inventoryItem.is_plan === 1;
                const isExpiring = inventoryItem && isExpiringSoon(inventoryItem.expiryDate);
                const daysUntilExpiry = inventoryItem ? getDaysUntilExpiry(inventoryItem.expiryDate) : null;

                return (
                  <div key={i} className="ingredient-row">
                    <div className="ingredient-info">
                      <span className="ingredient-name">
                        {ing.ingredientName || ing.name}
                      </span>
                      <span className="ingredient-quantity">
                        {ing.quantityNeeded && ing.unitName 
                          ? `(${ing.quantityNeeded} ${ing.unitName})` 
                          : ing.ingredientQty 
                          ? `(${ing.ingredientQty})` 
                          : ""
                        }
                      </span>
                    </div>
                    
                    {/* Priority Indicators */}
                    <div className="ingredient-indicators">
                      {isPlanned && (
                        <div className="indicator-badge planned" title="Planned ingredient">
                          <Calendar size={14} />
                          <span>Planned</span>
                        </div>
                      )}
                      {isExpiring && (
                        <div className="indicator-badge expiring" title={`Expires in ${daysUntilExpiry} days`}>
                          <Clock size={14} />
                          <span>
                            {daysUntilExpiry === 0 ? "Expires today" : 
                             daysUntilExpiry === 1 ? "Expires tomorrow" : 
                             `Expires in ${daysUntilExpiry} days`}
                          </span>
                        </div>
                      )}
                      {inventoryItem && !isPlanned && !isExpiring && (
                        <div className="indicator-badge available" title="Available in inventory">
                          <span className="indicator-dot"></span>
                          <span>Available</span>
                        </div>
                      )}
                      {!inventoryItem && (
                        <div className="indicator-badge missing" title="Not in inventory">
                          <AlertCircle size={14} />
                          <span>Missing</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Priority Summary - Only show for suggested recipes */}
          {isSuggested && ingredientList.some(ing => {
            const inventoryItem = getInventoryItem(ing.ingredientName || ing.name);
            return inventoryItem && (inventoryItem.is_plan === 1 || isExpiringSoon(inventoryItem.expiryDate));
          }) && (
            <div className="priority-summary">
              <p className="ing-title"><strong>Why this recipe is suggested:</strong></p>
              <div className="summary-badges">
                {ingredientList.some(ing => {
                  const inventoryItem = getInventoryItem(ing.ingredientName || ing.name);
                  return inventoryItem && inventoryItem.is_plan === 1;
                }) && (
                  <div className="summary-badge planned">
                    <Calendar size={16} />
                    <span>Uses planned ingredients</span>
                  </div>
                )}
                {ingredientList.some(ing => {
                  const inventoryItem = getInventoryItem(ing.ingredientName || ing.name);
                  return inventoryItem && isExpiringSoon(inventoryItem.expiryDate);
                }) && (
                  <div className="summary-badge expiring">
                    <Clock size={16} />
                    <span>Uses ingredients expiring soon</span>
                  </div>
                )}
              </div>
            </div>
          )}
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