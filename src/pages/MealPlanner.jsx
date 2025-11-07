// ✅ src/pages/MealPlanner.jsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import InventoryList from "../component/InventoryList";
import { motion, AnimatePresence } from "framer-motion";
import { loadWeek } from "../../api/services/MealPlanService";
import { loadInventory } from "../../api/services/InventoryService";
import "./MealPlanner.css";

export default function MealPlanner() {
  const navigate = useNavigate();
  const location = useLocation();

  const [mealPlanByWeek, setMealPlanByWeek] = useState({});
  const [weekOffset, setWeekOffset] = useState(0);
  const [inventory, setInventory] = useState([]);

  useEffect(() => {
    async function fetchInv() {
      const res = await loadInventory("U2");
      console.log("✅ Inventory response:", res);
      setInventory(res.inventory || []);
    }
    fetchInv();
  }, []);


  // ✅ Meal type map → database ID → UI field
  const mealTypeMap = {
    MT1: "breakfast",
    MT2: "lunch",
    MT3: "dinner",
    MT4: "snack"
  };

  // ✅ Empty week template
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

  // ✅ Get or initialize week
  function getMealPlanForWeek(offset) {
    if (!mealPlanByWeek[offset]) {
      const empty = createEmptyWeekPlan();
      setMealPlanByWeek(prev => ({ ...prev, [offset]: empty }));
      return empty;
    }
    return mealPlanByWeek[offset];
  }

  const mealPlan = getMealPlanForWeek(weekOffset);

  // ✅ Compute Monday of week
  function getStartOfWeek(offset) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);
    return monday;
  }

  function getWeekStartString(offset) {
    return getStartOfWeek(offset).toISOString().split("T")[0];
  }

  // ✅ When returning from RecipeList → jump to correct saved week
  useEffect(() => {
    if (location.state?.refreshDate) {
      const target = new Date(location.state.refreshDate);

      const todayWeekStart = getStartOfWeek(0);
      const diff = Math.floor((target - todayWeekStart) / 86400000);
      const offset = Math.floor(diff / 7);

      setWeekOffset(offset);

      // clear state so no infinite loop
      navigate(location.pathname, { replace: true });
    }
  }, []);

  // ✅ Fetch week’s meals
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

      entries.forEach(entry => {
        const dateObj = new Date(entry.mealDate);

        // ✅ Convert JS weekday → our UI order (MON first)
        const jsDay = dateObj.getDay(); // 0=Sun
        const uiDay = ["MON","TUE","WED","THU","FRI","SAT","SUN"][(jsDay + 6) % 7];

        const type = mealTypeMap[entry.mealTypeID];

        if (uiDay && type) {
          newWeek[uiDay][type] =
            entry.mealName ||
            entry.recipeName ||
            "";
        }
      });

      setMealPlanByWeek(prev => ({
        ...prev,
        [weekOffset]: newWeek
      }));

    } catch (e) {
      console.error("❌ Meal load error:", e);
    }
  }

  // ✅ Load on week change
  useEffect(() => {
    fetchWeek();
  }, [weekOffset]);

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

  // ✅ Week label
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

  function handleAddMeal(day, type) {
    navigate("/meal-planner/recipes", {
      state: { day, type, weekOffset }
    });
  }

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
                          onClick={() => handleAddMeal(d.day, m)}
                        >
                          {mealPlan[d.day][m] ? (
                            <span className="meal-filled">{mealPlan[d.day][m]}</span>
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
    </div>
  );
}
