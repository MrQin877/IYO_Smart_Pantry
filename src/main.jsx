// src/main.jsx
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
import Account from "./pages/Account.jsx";
import Settings from "./pages/Settings.jsx"; 
import "./main.css";

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
      {
        path: "food",
        element: <FoodCentre />,
        children: [
          { index: true, element: <MyFood /> },        
          { path: "donation", element: <MyDonation /> }
        ],
      },
      { path: "dashboard", element: <Dashboard /> },
      { path: "settings", element: <Settings /> },
    ],
  },

  { path: "*", element: <div>404</div> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
