// src/pages/MealPlanner.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InventoryList from "../component/InventoryList";
import "./MealPlanner.css";

export default function MealPlanner() {
  const navigate = useNavigate();

  const [mealPlan, setMealPlan] = useState({
    MON: { breakfast: "", lunch: "", dinner: "", snack: "" },
    TUE: { breakfast: "", lunch: "", dinner: "", snack: "" },
    WED: { breakfast: "", lunch: "", dinner: "", snack: "" },
    THU: { breakfast: "", lunch: "", dinner: "", snack: "" },
    FRI: { breakfast: "", lunch: "Chicken Salad", dinner: "", snack: "" },
    SAT: { breakfast: "", lunch: "", dinner: "", snack: "" },
    SUN: { breakfast: "", lunch: "", dinner: "", snack: "" },
  });

  const [inventory] = useState([
    { name: "Egg", qty: 1, expiry: "20/10/2025" },
    { name: "Rice", qty: 1, expiry: "03/10/2025" },
    { name: "Tomato", qty: 1, expiry: "06/11/2025" },
    { name: "Potato", qty: 1, expiry: "20/09/2025" },
    { name: "Elain Liow", qty: 1, expiry: "13/14/8520" },
  ]);

  function handleAddMeal(day, type) {
    // Instead of opening overlay, go to recipe page
    navigate("/meal-planner/recipes", {
      state: { day, type }, // optional: pass which meal user is adding
    });
  }

  const days = Object.keys(mealPlan);
  const meals = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="mealplanner-container">
      <div className="mealplanner-card">
        <div className="mealplanner-left">
          <table className="meal-table">
            <thead>
              <tr>
                <th>MEAL</th>
                {meals.map((m) => (
                  <th key={m}>{m.toUpperCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="day-col">{day}</td>
                  {meals.map((m) => (
                    <td
                      key={m}
                      className="meal-cell"
                      onClick={() => handleAddMeal(day, m)}
                    >
                      {mealPlan[day][m] ? (
                        <span className="meal-filled">{mealPlan[day][m]}</span>
                      ) : (
                        <span className="meal-add">+</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divider"></div>

        <div className="mealplanner-right">
          <InventoryList inventory={inventory} />
        </div>
      </div>
    </div>
  );
}
