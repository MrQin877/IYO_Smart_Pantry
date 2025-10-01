import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import FoodCentre from "./pages/FoodCentre.jsx";
<<<<<<< Updated upstream
import './main.css';
=======
import MyFood from "./pages/MyFood.jsx";
import MyDonation from "./pages/MyDonation.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import AuthLayout from "./AuthLayout.jsx";
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings.jsx"; // ⚙️ settings page
import "./main.css";
>>>>>>> Stashed changes

const router = createBrowserRouter([
  // Auth pages (no header)
  {
    path: "/",
    element: <AuthLayout />,
    children: [
      { path: "account", element: <Account /> }, 
    ],
  },
  
  // Main app (with header)
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
<<<<<<< Updated upstream
      { path: "food", element: <FoodCentre /> },
=======
      {
        path: "food",
        element: <FoodCentre />,
        children: [
          { index: true, element: <MyFood /> },        // /food
          { path: "donation", element: <MyDonation /> } // /food/donation
        ],
      },
      { path: "dashboard", element: <Dashboard /> },
      { path: "account", element: <Account /> },   // 🧑 Account page (Login + Register tabs)
      { path: "settings", element: <Settings /> },    // /settings
>>>>>>> Stashed changes
    ],
  },

  { path: "*", element: <div>404</div> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
