// src/component/MealActionModal.jsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getRecipeDetails } from '../../api/services/RecipeService';
import { markMealAsDone, deleteMeal, replanMeal } from '../../api/services/MealPlanService';
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
  recipeID,
  mealEntryID,
  userID,
  status  // Add this prop to show meal status
}) => {
  const [mealDetails, setMealDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({
    markAsDone: false,
    delete: false,
    replan: false
  });
  
  // Add this state to prevent double-clicks
  const [isProcessing, setIsProcessing] = useState(false);

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
      
      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch meal details');
      }

      // Transform data to match component's expected format
      const transformedData = {
        id: response.recipe.recipeID,
        name: response.recipe.recipeName,
        instructions: response.recipe.instruction 
          ? response.recipe.instruction.split('\n').filter(Boolean) 
          : [],
        ingredients: response.recipe.ingredients || [],
        servings: response.recipe.serving,
        isGeneric: response.recipe.isGeneric
      };

      setMealDetails(transformedData);
    } catch (error) {
      console.error("Error fetching meal details:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle marking meal as done
  const handleMarkAsDone = async () => {
    if (!mealEntryID) {
      alert('Meal entry ID is missing');
      return;
    }
    
    // Prevent double-clicks or multiple submissions
    if (isProcessing) {
      console.log("Already processing, ignoring click");
      return;
    }
    
    // Check if meal is already completed
    if (status === 'completed') {
      alert('This meal has already been marked as done');
      return;
    }
    
    setIsProcessing(true);
    setActionLoading(prev => ({ ...prev, markAsDone: true }));

    try {
      // Delegate the action to the parent so the parent can update its state/UI and close the modal.
      if (typeof onMarkAsDone === 'function') {
        const maybePromise = onMarkAsDone(mealEntryID);
        if (maybePromise && typeof maybePromise.then === 'function') {
          const res = await maybePromise;
          if (res && res.ok === false) {
            alert(res.error || 'Failed to mark meal as done');
          }
        }
      } else {
        // Fallback: perform API call here if parent handler is not provided
        const result = await markMealAsDone(mealEntryID, userID);
        if (result.ok) {
          alert('Meal marked as done successfully');
        } else {
          alert(result.error || 'Failed to mark meal as done');
        }
      }
    } catch (error) {
      console.error('Error marking meal as done:', error);
      alert('An error occurred while marking meal as done');
    } finally {
      setIsProcessing(false);
      setActionLoading(prev => ({ ...prev, markAsDone: false }));
    }
  };

  // Handle deleting meal
  const handleDelete = async () => {
    if (!mealEntryID) {
      alert('Meal entry ID is missing');
      return;
    }

    // Prevent double-clicks or multiple submissions
    if (isProcessing) {
      console.log("Already processing, ignoring click");
      return;
    }

    setIsProcessing(true);
    setActionLoading(prev => ({ ...prev, delete: true }));

    try {
      // Delegate deletion to parent to avoid duplicate API calls.
      // The parent should show confirmation and perform the actual delete.
      if (typeof onDelete === 'function') {
        const maybePromise = onDelete(mealEntryID);
        if (maybePromise && typeof maybePromise.then === 'function') {
          const res = await maybePromise;
          if (res && res.ok === false) {
            alert(res.error || 'Failed to delete meal');
          }
        }
      } else {
        alert('Delete action requires a parent handler (onDelete) to perform deletion.');
      }
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('An error occurred while deleting meal');
    } finally {
      setIsProcessing(false);
      setActionLoading(prev => ({ ...prev, delete: false }));
    }
  };

  // Handle replanning meal
  const handleReplan = async () => {
    if (!mealEntryID) {
      alert('Meal entry ID is missing');
      return;
    }
    
    // Prevent double-clicks or multiple submissions
    if (isProcessing) {
      console.log("Already processing, ignoring click");
      return;
    }
    
    setIsProcessing(true);
    setActionLoading(prev => ({ ...prev, replan: true }));
    
    try {
      // REMOVE blocking `prompt()` here. Delegate selection to the parent via onReplan.
      // The parent component should open a recipe-selection UI and perform the replan API call.
      if (typeof onReplan === 'function') {
        // Allow parent to return a promise with a result object { ok, error }
        const maybePromise = onReplan(mealEntryID);
        if (maybePromise && typeof maybePromise.then === 'function') {
          const res = await maybePromise;
          if (res && res.ok === false) {
            alert(res.error || 'Failed to replan meal');
          }
        }
      } else {
        // Fallback: inform developer/user that replan must be handled by parent
        alert('Replan action requires a parent handler (onReplan) to select a new recipe.');
      }
    } catch (error) {
      console.error('Error replanning meal:', error);
      alert('An error occurred while replanning meal');
    } finally {
      setIsProcessing(false);
      setActionLoading(prev => ({ ...prev, replan: false }));
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
            {/* Show status badge if meal is completed */}
            {status === 'completed' && (
              <p className="status-badge completed">✓ Already Completed</p>
            )}
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
        
        {/* ✅ CHANGE: Conditionally render action buttons based on status */}
        <div className="modal-actions">
          {status === 'completed' ? (
            // If meal is completed, only show a close button
            <div className="center-actions">
              <button 
                className="btn btn-primary" 
                onClick={onCancel}
              >
                Close
              </button>
            </div>
          ) : (
            // If meal is not completed, show all action buttons
            <>
              <button 
                className="btn btn-danger" 
                onClick={handleDelete}
                disabled={actionLoading.delete || isProcessing}
              >
                {actionLoading.delete ? 'Deleting...' : 'Delete'}
              </button>
              <div className="right-actions">
                <button 
                  className="btn btn-primary" 
                  onClick={handleReplan}
                  disabled={actionLoading.replan || isProcessing}
                >
                  {actionLoading.replan ? 'Replanning...' : 'Replan'}
                </button>
                <button 
                  className="btn btn-success" 
                  onClick={handleMarkAsDone}
                  disabled={actionLoading.markAsDone || isProcessing}
                >
                  {actionLoading.markAsDone ? 'Marking...' : 'Mark as Done'}
                </button>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MealActionModal;