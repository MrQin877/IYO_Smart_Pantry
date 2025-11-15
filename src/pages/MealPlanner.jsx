// src/pages/MealPlanner.jsx
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InventoryList from "../component/InventoryList";
import MealActionModal from "../component/MealActionModal";
import { motion, AnimatePresence } from "framer-motion";
import { loadWeek, markMealAsDone, deleteMeal, replanMeal } from "../../api/services/MealPlanService";
import { loadInventory } from "../../api/services/InventoryService";
import { getRecipeDetails } from "../../api/services/RecipeService";
import "./MealPlanner.css";

export default function MealPlanner() {
  const navigate = useNavigate();
  const location = useLocation();

  // Get user ID from session (preferred) or localStorage fallback
  const [userID, setUserID] = useState(() => {
    return localStorage.getItem('userID') || null;
  });

  // Try to resolve session user on mount and update userID
  useEffect(() => {
    let mounted = true;
    async function resolveSession() {
      try {
        const resp = await fetch('/api/session.php', { credentials: 'include' });
        const data = await resp.json();
        if (!mounted) return;
        if (data.ok && data.user) {
          const id = data.user.id || data.user.userID || data.userID || null;
          if (id) setUserID(id);
        }
      } catch (err) {
        // ignore — we'll use localStorage fallback if present
        console.debug('Session fetch failed, using localStorage if available');
      }
    }

    resolveSession();
    return () => { mounted = false; };
  }, []);

  const [mealPlanByWeek, setMealPlanByWeek] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Improved modal state with status tracking
  const [modalState, setModalState] = useState({
    isOpen: false,
    day: null,
    type: null,
    mealName: "",
    recipeID: null,
    mealEntryID: null,
    status: null,
    instructions: "",
    ingredients: []
  });

  // Meal type map → database ID → UI field
  const mealTypeMap = {
    MT1: "breakfast",
    MT2: "lunch",
    MT3: "dinner",
    MT4: "snack"
  };

  // Create empty week template with proper structure
  const createEmptyWeekPlan = useCallback(() => {
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const meals = ["breakfast", "lunch", "dinner", "snack"];
    
    const weekPlan = {};
    days.forEach(day => {
      weekPlan[day] = {};
      meals.forEach(meal => {
        weekPlan[day][meal] = {
          name: "",
          status: null,
          recipeID: null,
          mealEntryID: null
        };
      });
    });
    
    return weekPlan;
  }, []);

  // Get or initialize week
  const getMealPlanForWeek = useCallback((offset) => {
    if (!mealPlanByWeek[offset]) {
      const empty = createEmptyWeekPlan();
      setMealPlanByWeek(prev => ({ ...prev, [offset]: empty }));
      return empty;
    }
    return mealPlanByWeek[offset];
  }, [mealPlanByWeek, createEmptyWeekPlan]);

  const mealPlan = getMealPlanForWeek(weekOffset);

  // Compute Monday of week
  const getStartOfWeek = useCallback((offset) => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);
    return monday;
  }, []);

  // Helper to get YYYY-MM-DD in LOCAL timezone
  const toLocalDateString = useCallback((date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }, []);

  const getWeekStartString = useCallback((offset) => {
    const mondayDate = getStartOfWeek(offset);
    return toLocalDateString(mondayDate);
  }, [getStartOfWeek, toLocalDateString]);

  // Fetch inventory data
  const fetchInventory = useCallback(async () => {
    try {
      const res = await loadInventory(userID);
      console.log("✅ Inventory response:", res);
      setInventory(res.inventory || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  }, [userID]);

  // Fetch week's meals
  const fetchWeek = useCallback(async () => {
    // start loading indicator and record timestamp so we can ensure
    // the loading UI stays visible for a short minimum duration to
    // avoid a flicker when the request completes very quickly.
    const MIN_LOADING_MS = 300;
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    loadingStartRef.current = Date.now();
    setIsLoading(true);
    try {
      const weekStart = getWeekStartString(weekOffset);
      const res = await loadWeek({ userID, weekStart });

      if (!res.ok) {
        console.error("❌ Meal load error:", res.error);
        return;
      }

      console.log("✅ Loaded entries from backend:", res.entries);
      const entries = res.entries || [];
      const newWeek = createEmptyWeekPlan();

      // Process entries and update status from database
      entries.forEach(entry => {
        const dateObj = new Date(entry.mealDate);
        const jsDay = dateObj.getDay(); // 0=Sun
        const uiDay = ["MON","TUE","WED","THU","FRI","SAT","SUN"][(jsDay + 6) % 7];
        const type = mealTypeMap[entry.mealTypeID];

        if (uiDay && type) {
          const mealName = entry.mealName || entry.recipeName || "";
          
          // Store meal data with proper structure including status
          newWeek[uiDay][type] = {
            name: mealName,
            status: entry.status || null,
            recipeID: entry.recipeID || null,
            mealEntryID: entry.mealEntryID
          };
        }
      });

      setMealPlanByWeek(prev => ({
        ...prev,
        [weekOffset]: newWeek
      }));
    } catch (e) {
      console.error("❌ Meal load error:", e);
    } finally {
      const elapsed = Date.now() - (loadingStartRef.current || 0);
      const remaining = Math.max(0, MIN_LOADING_MS - elapsed);
      // ensure we don't clear an earlier timeout
      loadingTimeoutRef.current = setTimeout(() => {
        setIsLoading(false);
        loadingTimeoutRef.current = null;
      }, remaining);
    }
  }, [userID, weekOffset, getWeekStartString, createEmptyWeekPlan]);

  // refs for managing the loading minimum duration timer
  const loadingStartRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  // Handle clicking on a meal cell
  const handleMealClick = useCallback((day, type) => {
    const mealData = mealPlan[day][type];
    
    if (mealData.name) {
      // Open modal for existing meal with details
      // Allow opening for completed meals too, but pass the status
      setModalState({
        isOpen: true,
        day,
        type,
        mealName: mealData.name,
        recipeID: mealData.recipeID,
        mealEntryID: mealData.mealEntryID,
        status: mealData.status
      });
    } else {
      // Navigate to recipe selection for empty meal
      handleAddMeal(day, type);
    }
  }, [mealPlan]);

  // Handle adding a meal
  const handleAddMeal = useCallback((day, type) => {
    navigate("/meal-planner/recipes", {
      state: { day, type, weekOffset }
    });
  }, [navigate, weekOffset]);

  // Handle marking meal as done
  const handleMarkAsDone = useCallback(async (mealEntryIDParam) => {
    const targetMealEntryID = mealEntryIDParam || modalState.mealEntryID;

    if (!targetMealEntryID) {
      alert('Meal entry ID is missing');
      return { ok: false, error: 'Meal entry ID missing' };
    }

    try {
      const result = await markMealAsDone(targetMealEntryID, userID);

      if (result.ok) {
        // Update the meal status in the current week plan
        const updatedWeek = { ...mealPlan };
        if (modalState.day && modalState.type) {
          updatedWeek[modalState.day][modalState.type] = {
            ...updatedWeek[modalState.day][modalState.type],
            status: 'completed'
          };
        }

        setMealPlanByWeek(prev => ({
          ...prev,
          [weekOffset]: updatedWeek
        }));

        // Close modal
        setModalState({
          isOpen: false,
          day: null,
          type: null,
          mealName: "",
          recipeID: null,
          mealEntryID: null,
          status: null,
          instructions: "",
          ingredients: []
        });

        // Refresh inventory to update used quantities
        fetchInventory();

        // Also bump a refreshKey so fetchWeek runs and reloads from server
        setRefreshKey(prev => prev + 1);

        return { ok: true };
      } else {
        alert(result.error || 'Failed to mark meal as done');
        return result;
      }
    } catch (error) {
      console.error('Error marking meal as done:', error);
      alert('An error occurred while marking meal as done');
      return { ok: false, error: error.message };
    }
  }, [modalState, userID, weekOffset, mealPlan, fetchInventory]);

  // Handle replanning a meal
  const handleReplan = useCallback(() => {
    // Close modal and navigate to recipe selection for replanning
    setModalState({
      isOpen: false,
      day: null,
      type: null,
      mealName: "",
      recipeID: null,
      mealEntryID: null,
      status: null,
      instructions: "",
      ingredients: []
    });
    
    // Navigate to recipe selection with replan context
    navigate("/meal-planner/recipes", {
      state: { 
        day: modalState.day, 
        type: modalState.type, 
        weekOffset,
        isReplan: true,
        mealEntryID: modalState.mealEntryID
      }
    });
  }, [modalState, navigate, weekOffset]);

  // Handle deleting a meal
  // Accept optional mealEntryID param so parent can be called from child without relying
  // on modalState (modal will still have modalState set at call time).
  const handleDelete = useCallback(async (mealEntryIDParam) => {
    const targetMealEntryID = mealEntryIDParam || modalState.mealEntryID;

    if (!targetMealEntryID) {
      alert('Meal entry ID is missing');
      return { ok: false, error: 'Meal entry ID missing' };
    }

    if (!window.confirm('Are you sure you want to delete this meal? This will return all reserved ingredients to your inventory.')) {
      return { ok: false, error: 'User cancelled' };
    }

    try {
      const result = await deleteMeal(targetMealEntryID, userID);

      if (result.ok) {
        alert('Meal deleted successfully');

        // Remove the meal from the current week plan
        const updatedWeek = { ...mealPlan };
        // Use modalState day/type if available; otherwise we can't update UI precisely here
        if (modalState.day && modalState.type) {
          updatedWeek[modalState.day][modalState.type] = {
            name: "",
            status: null,
            recipeID: null,
            mealEntryID: null
          };
        }

        setMealPlanByWeek(prev => ({
          ...prev,
          [weekOffset]: updatedWeek
        }));

        // Close modal and refresh inventory
        setModalState({
          isOpen: false,
          day: null,
          type: null,
          mealName: "",
          recipeID: null,
          mealEntryID: null,
          status: null,
          instructions: "",
          ingredients: []
        });

        // Refresh inventory to update reserved quantities
        fetchInventory();
      } else {
        alert(result.error || 'Failed to delete meal');
      }

      // Return result so caller (modal) can await and react if needed
      return result;
    } catch (error) {
      console.error('Error deleting meal:', error);
      alert('An error occurred while deleting meal');
      return { ok: false, error: error.message };
    }
  }, [modalState, userID, weekOffset, mealPlan, fetchInventory]);

  // Handle closing the modal
  const handleCancelModal = useCallback(() => {
    setModalState({
      isOpen: false,
      day: null,
      type: null,
      mealName: "",
      recipeID: null,
      mealEntryID: null,
      status: null,
      instructions: "",
      ingredients: []
    });
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  // Fetch data when weekOffset changes or when refreshKey is incremented
  useEffect(() => {
    fetchWeek();
  }, [weekOffset, refreshKey, fetchWeek]);

  // When returning from RecipeList → jump to correct saved week and refresh data
  useEffect(() => {
    if (location.state?.refreshDate) {
      // Parse YYYY-MM-DD as LOCAL date to avoid UTC parsing issues
      const parts = String(location.state.refreshDate).split('-').map(Number);
      // parts = [year, month, day]
      const target = parts.length === 3 ? new Date(parts[0], parts[1] - 1, parts[2]) : new Date(location.state.refreshDate);
      const todayWeekStart = getStartOfWeek(0);
      // Normalize both dates to local midnight to avoid timezone/time-of-day offsets
      target.setHours(0,0,0,0);
      todayWeekStart.setHours(0,0,0,0);
      const diff = Math.floor((target - todayWeekStart) / 86400000);
      const offset = Math.floor(diff / 7);

      setWeekOffset(offset);
      setRefreshKey(prev => prev + 1);

      // Clear state so no infinite loop
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.state, navigate, getStartOfWeek]);

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
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 1 }}
              >
                <thead>
                  <tr>
                    <th>MEAL</th>
                    {meals.map(m => <th key={m}>{m.toUpperCase()}</th>)}
                  </tr>
                </thead>

                <motion.tbody
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={{
                    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
                    hidden: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                  }}
                >
                  {weekDays.map(d => (
                    <motion.tr
                      key={d.day}
                      variants={{
                        visible: { opacity: 1, x: 0 },
                        hidden: { opacity: 0, x: weekOffset > 0 ? 50 : -50 }
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <td className="day-col">
                        {d.day}
                        <br />
                        <span className="date-text">{d.date}</span>
                      </td>

                      {meals.map(m => (
                        <td
                          key={m}
                          className={`meal-cell ${mealPlan[d.day][m].status === 'completed' ? 'completed-meal' : ''}`}
                          onClick={() => handleMealClick(d.day, m)}
                        >
                          {mealPlan[d.day][m].name ? (
                            <span className="meal-filled">
                              {mealPlan[d.day][m].status === 'completed' && (
                                <span className="checkmark">✓</span>
                              )}
                              {mealPlan[d.day][m].name}
                            </span>
                          ) : (
                            <span className="meal-add">+</span>
                          )}
                        </td>
                      ))}
                    </motion.tr>
                  ))}
                </motion.tbody>
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
            onMarkAsDone={handleMarkAsDone}
            onReplan={handleReplan}
            onDelete={handleDelete}
            onCancel={handleCancelModal}
            recipeID={modalState.recipeID}
            mealEntryID={modalState.mealEntryID}
            userID={userID}
            status={modalState.status}
          />
        )}
      </AnimatePresence>
    </div>
  );
}