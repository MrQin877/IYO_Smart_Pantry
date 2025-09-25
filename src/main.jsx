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
import "./main.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      {
        path: "food",
        element: <FoodCentre />,
        children: [
          { index: true, element: <MyFood /> },        // /food
          { path: "donation", element: <MyDonation /> } // /food/donation
        ],
      },
      { path: "dashboard", element: <Dashboard /> },
    ],
  },
  { path: "*", element: <div>404</div> },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
