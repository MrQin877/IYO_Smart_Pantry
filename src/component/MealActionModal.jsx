// src/component/MealActionModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRecipeDetails } from '../../api/services/RecipeService';
import './MealActionModal.css';

const MealActionModal = ({ 
  isOpen, 
  mealName, 
  day, 
  type, 
  onMarkAsDone, 
  onReplan, 
  onCancel,
  onDelete,
  recipeID
}) => {
  const [mealDetails, setMealDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch meal details when modal opens
  useEffect(() => {
    if (isOpen && recipeID) {
      fetchMealDetails();
    } else if (isOpen && !recipeID) {
      setMealDetails(null);
      setError(null);
    }
  }, [isOpen, recipeID]);

  const fetchMealDetails = async () => {
    if (!recipeID) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getRecipeDetails(recipeID);
      
      // Log the response to debug
      console.log("API Response:", response);
      
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch meal details');
      }

      // Transform the data to match the component's expected format
      const transformedData = {
        id: response.recipe.recipeID,
        name: response.recipe.recipeName,
        instructions: response.recipe.instruction 
          ? response.recipe.instruction.split('\n').filter(Boolean) 
          : [],
        // Fix: Access ingredients from recipe.ingredients
        ingredients: response.recipe.ingredients || [],
        servings: response.recipe.serving,
        isGeneric: response.recipe.isGeneric
      };

      // Log the transformed data to debug
      console.log("Transformed Data:", transformedData);

      setMealDetails(transformedData);
    } catch (error) {
      console.error("Error fetching meal details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onCancel}
    >
      <motion.div
        className="modal-container meal-details-modal"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3>{mealName}</h3>
          <button className="close-button" onClick={onCancel}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="meal-info">
            <p>Day: <strong>{day}</strong></p>
            <p>Type: <strong>{type}</strong></p>
          </div>
          
          {isLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading meal details...</p>
            </div>
          ) : error ? (
            <div className="error-container">
              <p>Error: {error}</p>
              <button className="btn btn-secondary" onClick={fetchMealDetails}>
                Try Again
              </button>
            </div>
          ) : mealDetails ? (
            <div className="meal-details">
              <div className="meal-meta">
                <span className="meta-item">
                  <i className="icon-people"></i> Servings: {mealDetails.servings}
                </span>
                {/* ✅ CHANGE: Use a ternary operator for badges */}
                {mealDetails.isGeneric ? (
                  <span className="meta-item generic-badge">
                    <i className="icon-tag"></i> Generic Recipe
                  </span>
                ) : (
                  <span className="meta-item custom-badge">
                    <i className="icon-star"></i> Custom Meal
                  </span>
                )}

              </div>
              
              <div className="meal-section">
                <h4>Ingredients</h4>
                {mealDetails.ingredients && mealDetails.ingredients.length > 0 ? (
                  <ul className="ingredients-list">
                    {mealDetails.ingredients.map((ingredient, index) => (
                      <li key={index}>
                        {ingredient.quantityNeeded} {ingredient.unitName} {ingredient.ingredientName}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>No ingredients listed for this recipe.</p>
                )}
              </div>
              
              <div className="meal-section">
                <h4>Instructions</h4>
                {/* ✅ CHANGE: Removed numbered list */}
                <div className="instructions-list">
                  {mealDetails.instructions.map((instruction, index) => (
                    <p key={index}>{instruction}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="no-details">
              <p>No detailed information available for this meal.</p>
              {recipeID && (
                <button className="btn btn-secondary" onClick={fetchMealDetails}>
                  Load Recipe Details
                </button>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-actions">
          <button className="btn btn-danger" onClick={onDelete}>
            Delete
          </button>
          <div className="right-actions">
            <button className="btn btn-primary" onClick={onReplan}>
              Replan
            </button>
            <button className="btn btn-success" onClick={onMarkAsDone}>
              Mark as Done
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MealActionModal;
