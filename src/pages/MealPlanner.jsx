// src/pages/MealPlanner.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import InventoryList from "../component/InventoryList";
import { motion, AnimatePresence } from "framer-motion";
import { loadWeek } from "../../api/services/MealPlanService"; // ✅ Ensure same name
import "./MealPlanner.css";

export default function MealPlanner() {
  const navigate = useNavigate();

  // ✅ Store meal plans PER WEEK
  const [mealPlanByWeek, setMealPlanByWeek] = useState({});

  // ✅ Current week offset (0 = this week)
  const [weekOffset, setWeekOffset] = useState(0);

  // ✅ Create empty meal plan template
  function createEmptyWeekPlan() {
    return {
      MON: { breakfast: "", lunch: "", dinner: "", snack: "" },
      TUE: { breakfast: "", lunch: "", dinner: "", snack: "" },
      WED: { breakfast: "", lunch: "", dinner: "", snack: "" },
      THU: { breakfast: "", lunch: "", dinner: "", snack: "" },
      FRI: { breakfast: "", lunch: "", dinner: "", snack: "" },
      SAT: { breakfast: "", lunch: "", dinner: "", snack: "" },
      SUN: { breakfast: "", lunch: "", dinner: "", snack: "" },
    };
  }

  // ✅ Retrieve meal plan for current week
  function getMealPlanForWeek(offset) {
    if (!mealPlanByWeek[offset]) {
      setMealPlanByWeek(prev => ({
        ...prev,
        [offset]: createEmptyWeekPlan(),
      }));
      return createEmptyWeekPlan();
    }
    return mealPlanByWeek[offset];
  }

  const mealPlan = getMealPlanForWeek(weekOffset);

  // ✅ Update meal ONLY for the selected week
  function updateMeal(day, type, value) {
    setMealPlanByWeek(prev => ({
      ...prev,
      [weekOffset]: {
        ...prev[weekOffset],
        [day]: {
          ...prev[weekOffset][day],
          [type]: value,
        },
      },
    }));
  }

  // ✅ Inventory list (unchanged)
  const [inventory] = useState([
    { name: "Egg", qty: 1, expiry: "20/10/2025" },
    { name: "Rice", qty: 1, expiry: "03/10/2025" },
    { name: "Tomato", qty: 1, expiry: "06/11/2025" },
    { name: "Potato", qty: 1, expiry: "20/09/2025" },
    { name: "Elain Liow", qty: 1, expiry: "13/14/8520" },
  ]);

  // ✅ Calculate Monday of the selected week
  function getStartOfWeek(offset) {
    const now = new Date();
    const day = now.getDay(); // 0 = Sun, 1 = Mon...
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.setDate(diff));
    monday.setDate(monday.getDate() + offset * 7);
    return monday;
  }

  function getWeekStartString(offset) {
    return getStartOfWeek(offset).toISOString().split("T")[0];
  }

  // ✅ Load meals from backend
  async function fetchWeek() {
    try {
      const weekStart = getWeekStartString(weekOffset);

      const res = await loadWeek({
        userID: "U2",
        weekStart,
      });

      if (!res.ok) {
        console.error("❌ Meal load error:", res.error);
        return;
      }

      const entries = res.entries || [];
      const newWeekPlan = createEmptyWeekPlan();

      entries.forEach(item => {
        const date = new Date(item.mealDate);

        const day = date
          .toLocaleDateString("en-GB", { weekday: "short" })
          .toUpperCase();

        const type = item.mealTypeName.toLowerCase();

        newWeekPlan[day][type] = item.mealTitle || "";
      });

      setMealPlanByWeek(prev => ({
        ...prev,
        [weekOffset]: newWeekPlan,
      }));
    } catch (err) {
      console.error("❌ Meal load error:", err);
    }
  }

  // ✅ Auto-load when switching week
  useEffect(() => {
    fetchWeek();
  }, [weekOffset]);

  // ✅ Create full week date list
  function getWeekDates(offset) {
    const start = getStartOfWeek(offset);
    const list = [];

    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);

      list.push({
        day: ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"][i],
        date: d.toLocaleDateString("en-GB"),
      });
    }

    return list;
  }

  const weekDays = getWeekDates(weekOffset);

  // ✅ Build week range label e.g. "27 Jan – 02 Feb"
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

  // ✅ Navigate to recipe page
  function handleAddMeal(day, type) {
    navigate("/meal-planner/recipes", {
      state: { day, type, weekOffset },
    });
  }

  const meals = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="mealplanner-container">
      <div className="mealplanner-card">
        <div className="mealplanner-content">

          <div className="mealplanner-left">

            {/* ✅ Week Navigation */}
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

          <div className="divider"></div>

          <div className="mealplanner-right">
            <InventoryList inventory={inventory} />
          </div>
        </div>
      </div>
    </div>
  );
}
