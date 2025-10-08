/*
import { useState } from "react";
import Login from "../page/Login.jsx";
import Register from "../component/Register.jsx";

export default function Account() {
  const [tab, setTab] = useState("login");

  return (
    <div style={{ maxWidth: 400, margin: "40px auto" }}>
      <img className="logo" src="/logo.svg" alt='IYO Logo's />
      <div className="tab-switcher">
        <button
          className={tab === "login" ? "active" : ""}
          onClick={() => setTab("login")}
        >
          Login
        </button>
        <button
          className={tab === "register" ? "active" : ""}
          onClick={() => setTab("register")}
        >
          Register
        </button>
      </div>

      {tab === "login" && <Login onSuccess={(id) => console.log("Logged in:", id)} />}
      {tab === "register" && <Register />}
    </div>
  );
}
*/