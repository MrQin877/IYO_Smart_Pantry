// src/pages/MealPlanner.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InventoryList from "../component/InventoryList";
import MealActionModal from "../component/MealActionModal";
import { motion, AnimatePresence } from "framer-motion";
import { loadWeek } from "../../api/services/MealPlanService";
import { loadInventory } from "../../api/services/InventoryService";
import { getRecipeDetails } from "../../api/services/RecipeService"; // New import
import "./MealPlanner.css";

export default function MealPlanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mealPlanByWeek, setMealPlanByWeek] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [mealDetails, setMealDetails] = useState({}); // New state for meal details
  
  // =================================================================
  // ✅ FIX #2: Add a refreshKey to force data re-fetching
  // =================================================================
  const [refreshKey, setRefreshKey] = useState(0);
  
  // New state for modal
  const [modalState, setModalState] = useState({
    isOpen: false,
    day: null,
    type: null,
    mealName: "",
    recipeID: null, // Add recipeID
    instructions: "", // Add instructions
    ingredients: [] // Add ingredients
  });

  useEffect(() => {
    async function fetchInv() {
      const res = await loadInventory("U2");
      console.log("✅ Inventory response:", res);
      setInventory(res.inventory || []);
    }
    fetchInv();
  }, []);

  // Meal type map → database ID → UI field
  const mealTypeMap = {
    MT1: "breakfast",
    MT2: "lunch",
    MT3: "dinner",
    MT4: "snack"
  };

  // Empty week template
  function createEmptyWeekPlan() {
    return {
      MON: { breakfast: "", lunch: "", dinner: "", snack: "" },
      TUE: { breakfast: "", lunch: "", dinner: "", snack: "" },
      WED: { breakfast: "", lunch: "", dinner: "", snack: "" },
      THU: { breakfast: "", lunch: "", dinner: "", snack: "" },
      FRI: { breakfast: "", lunch: "", dinner: "", snack: "" },
      SAT: { breakfast: "", lunch: "", dinner: "", snack: "" },
      SUN: { breakfast: "", lunch: "", dinner: "", snack: "" }
    };
  }

  // Get or initialize week
  function getMealPlanForWeek(offset) {
    if (!mealPlanByWeek[offset]) {
      const empty = createEmptyWeekPlan();
      setMealPlanByWeek(prev => ({ ...prev, [offset]: empty }));
      return empty;
    }
    return mealPlanByWeek[offset];
  }

  const mealPlan = getMealPlanForWeek(weekOffset);

  // Compute Monday of week
  function getStartOfWeek(offset) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);
    return monday;
  }

  // =================================================================
  // ✅ FIX #1: Helper to get YYYY-MM-DD in LOCAL timezone (not UTC)
  // =================================================================
  function toLocalDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getWeekStartString(offset) {
    const mondayDate = getStartOfWeek(offset);
    return toLocalDateString(mondayDate); // Use the new helper function
  }

  // When returning from RecipeList → jump to correct saved week and refresh data
  useEffect(() => {
    if (location.state?.refreshDate) {
      const target = new Date(location.state.refreshDate);

      const todayWeekStart = getStartOfWeek(0);
      const diff = Math.floor((target - todayWeekStart) / 86400000);
      const offset = Math.floor(diff / 7);

      setWeekOffset(offset);

      // =================================================================
      // ✅ FIX #2: Increment the refreshKey to trigger a data re-fetch
      // =================================================================
      setRefreshKey(prev => prev + 1);

      // clear state so no infinite loop
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate]); // Added dependencies

  // Fetch recipe details for a meal
  async function fetchRecipeDetails(recipeID) {
    // Check if we already have the details
    if (mealDetails[recipeID]) {
      return mealDetails[recipeID];
    }

    try {
      // You'll need to implement this API service
      const res = await getRecipeDetails(recipeID);
      
      if (res.ok) {
        const details = {
          instructions: res.recipe.instruction,
          ingredients: res.ingredients.map(ing => ({
            name: ing.ingredientName,
            quantity: ing.quantityNeeded,
            unit: ing.unitName
          }))
        };
        
        // Cache the details
        setMealDetails(prev => ({
          ...prev,
          [recipeID]: details
        }));
        
        return details;
      }
    } catch (error) {
      console.error("Error fetching recipe details:", error);
      return null;
    }
  }

  // Fetch week's meals
  async function fetchWeek() {
    try {
      const weekStart = getWeekStartString(weekOffset);

      const res = await loadWeek({
        userID: "U2",
        weekStart
      });

      if (!res.ok) {
        console.error("❌ Meal load error:", res.error);
        return;
      }

      console.log("✅ Loaded entries from backend:", res.entries);

      const entries = res.entries || [];
      const newWeek = createEmptyWeekPlan();

      // Process entries and fetch recipe details for each meal
      const recipePromises = entries.map(async entry => {
        const dateObj = new Date(entry.mealDate);

        // Convert JS weekday → our UI order (MON first)
        const jsDay = dateObj.getDay(); // 0=Sun
        const uiDay = ["MON","TUE","WED","THU","FRI","SAT","SUN"][(jsDay + 6) % 7];

        const type = mealTypeMap[entry.mealTypeID];

        if (uiDay && type) {
          const mealName = entry.mealName || entry.recipeName || "";
          
          // Store basic meal info
          newWeek[uiDay][type] = mealName;
          
          // If there's a recipe ID, fetch its details
          if (entry.recipeID) {
            return {
              day: uiDay,
              type,
              recipeID: entry.recipeID,
              mealName
            };
          }
        }
        return null;
      });

      // Filter out null values
      const validMeals = recipePromises.filter(Boolean);
      
      // Fetch recipe details for all meals with recipes
      const mealsWithRecipes = await Promise.all(
        validMeals.map(async meal => {
          if (meal && meal.recipeID) {
            const details = await fetchRecipeDetails(meal.recipeID);
            return {
              ...meal,
              ...details
            };
          }
          return meal;
        })
      );

      // Store meal details in state
      const newMealDetails = {};
      mealsWithRecipes.forEach(meal => {
        if (meal && meal.recipeID) {
          newMealDetails[`${meal.day}-${meal.type}`] = {
            recipeID: meal.recipeID,
            instructions: meal.instructions,
            ingredients: meal.ingredients
          };
        }
      });
      
      setMealDetails(prev => ({
        ...prev,
        ...newMealDetails
      }));

      setMealPlanByWeek(prev => ({
        ...prev,
        [weekOffset]: newWeek
      }));

    } catch (e) {
      console.error("❌ Meal load error:", e);
    }
  }

  // =================================================================
  // ✅ FIX #2: Fetch data when weekOffset changes OR when refreshKey is incremented
  // =================================================================
  useEffect(() => {
    fetchWeek();
  }, [weekOffset, refreshKey]);

  const meals = ["breakfast", "lunch", "dinner", "snack"];

  const weekDays = (() => {
    const start = getStartOfWeek(weekOffset);
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push({
        day: ["MON","TUE","WED","THU","FRI","SAT","SUN"][i],
        date: d.toLocaleDateString("en-GB")
      });
    }
    return days;
  })();

  // Week label
  const weekRangeText = (() => {
    const start = getStartOfWeek(weekOffset);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return (
      start.toLocaleDateString("en-GB", { day: "2-digit", month: "short" }) +
      " – " +
      end.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })
    );
  })();

  // Handle clicking on a meal cell
  function handleMealClick(day, type) {
    const mealName = mealPlan[day][type];
    const mealKey = `${day}-${type}`;
    const details = mealDetails[mealKey];
    
    if (mealName) {
      // Open modal for existing meal with details
      setModalState({
        isOpen: true,
        day,
        type,
        mealName,
        recipeID: details?.recipeID || null,
        instructions: details?.instructions || "",
        ingredients: details?.ingredients || []
      });
    } else {
      // Navigate to recipe selection for empty meal
      handleAddMeal(day, type);
    }
  }

  function handleAddMeal(day, type) {
    navigate("/meal-planner/recipes", {
      state: { day, type, weekOffset }
    });
  }

  // Modal action handlers
  const handleMarkAsDone = () => {
    // Update meal plan to mark as done
    const updatedPlan = { ...mealPlan };
    updatedPlan[modalState.day][modalState.type] = `${modalState.mealName} ✓`;
    
    setMealPlanByWeek(prev => ({
      ...prev,
      [weekOffset]: updatedPlan
    }));
    
    // Close modal
    setModalState({
      isOpen: false,
      day: null,
      type: null,
      mealName: "",
      recipeID: null,
      instructions: "",
      ingredients: []
    });
    
    // Here you would also update the backend
    // updateMealStatus(modalState.day, modalState.type, 'completed');
  };

  const handleReplan = () => {
    // Close modal and navigate to recipe selection
    setModalState({
      isOpen: false,
      day: null,
      type: null,
      mealName: "",
      recipeID: null,
      instructions: "",
      ingredients: []
    });
    
    navigate("/meal-planner/recipes", {
      state: { 
        day: modalState.day, 
        type: modalState.type, 
        weekOffset,
        isReplan: true
      }
    });
  };

  const handleCancelModal = () => {
    setModalState({
      isOpen: false,
      day: null,
      type: null,
      mealName: "",
      recipeID: null,
      instructions: "",
      ingredients: []
    });
  };

  return (
    <div className="mealplanner-container">
      <div className="mealplanner-card">
        <div className="mealplanner-content">

          {/* LEFT */}
          <div className="mealplanner-left">

            <div className="week-nav">
              <button onClick={() => setWeekOffset(weekOffset - 1)}>⬅ Previous</button>
              <span className="week-label">{weekRangeText}</span>
              <button onClick={() => setWeekOffset(weekOffset + 1)}>Next ➡</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.table
                key={weekOffset}
                className="meal-table"
                initial={{ opacity: 0, x: weekOffset > 0 ? 80 : -80 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: weekOffset > 0 ? -80 : 80 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              >
                <thead>
                  <tr>
                    <th>MEAL</th>
                    {meals.map(m => <th key={m}>{m.toUpperCase()}</th>)}
                  </tr>
                </thead>

                <tbody>
                  {weekDays.map(d => (
                    <tr key={d.day}>
                      <td className="day-col">
                        {d.day}
                        <br />
                        <span className="date-text">{d.date}</span>
                      </td>

                      {meals.map(m => (
                        <td
                          key={m}
                          className="meal-cell"
                          onClick={() => handleMealClick(d.day, m)}
                        >
                          {mealPlan[d.day][m] ? (
                            <span className="meal-filled">
                              {mealPlan[d.day][m].includes('✓') ? 
                                <span className="completed-meal">{mealPlan[d.day][m]}</span> : 
                                mealPlan[d.day][m]
                              }
                            </span>
                          ) : (
                            <span className="meal-add">+</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </motion.table>
            </AnimatePresence>

          </div>

          {/* Divider */}
          <div className="divider"></div>

          {/* RIGHT */}
          <div className="mealplanner-right">
            <InventoryList inventory={inventory} />
          </div>

        </div>
      </div>

      {/* Meal Action Modal */}
      <AnimatePresence>
        {modalState.isOpen && (
          <MealActionModal
            isOpen={modalState.isOpen}
            mealName={modalState.mealName}
            day={modalState.day}
            type={modalState.type}
            recipeID={modalState.recipeID}
            instructions={modalState.instructions}
            ingredients={modalState.ingredients}
            onMarkAsDone={handleMarkAsDone}
            onReplan={handleReplan}
            onCancel={handleCancelModal}
          />
        )}
      </AnimatePresence>
    </div>
  );
}