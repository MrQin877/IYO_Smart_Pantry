import { Navigate } from "react-router-dom";
import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import FoodCentre from "./pages/FoodCentre.jsx";
import MyFood from "./pages/MyFood.jsx";
import MyDonation from "./pages/MyDonation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthLayout from "./AuthLayout.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Settings from "./pages/Settings.jsx";
import Verify from "./pages/Verify.jsx";
import Notification from "./pages/Notification.jsx";
import NotificationDetail from "./pages/NotificationDetail.jsx";
import MealPlanner from "./pages/MealPlanner.jsx";
import RecipeList from "./component/RecipeList.jsx";
import CustomMealPlan from "./component/CustomMealPlan.jsx";
import FoodAnalytics from "./pages/FoodAnalytics.jsx";
import "./main.css";

const router = createBrowserRouter([
  // Auth pages (no header)
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },


  // Main app (with header)
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "food",
        element: <FoodCentre />,
        children: [
          { index: true, element: <MyFood /> },
          { path: "donation", element: <MyDonation /> },
        ],
      },
      { path: "dashboard", element: <Dashboard /> },
      { path: "analytics", element: <FoodAnalytics /> },
      { path: "settings", element: <Settings /> },
      { path: "notification", element: <Notification /> },
      { path: "notification/:id", element: <NotificationDetail /> },
      { path: "meal-planner", element: <MealPlanner /> },
      {path: "meal-planner/recipes", element: <RecipeList />,},
      {path:"/custom-meal", element:<CustomMealPlan />,}

    ],
  },

  // Redirect old account path
  { path: "/account", element: <Navigate to="/login" replace /> },

  { path: "*", element: <div>404 Not Found</div> },

  {
  path: "/verify",
  element: <Verify />
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
