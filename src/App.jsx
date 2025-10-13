//./src/App.jsx
import { Outlet } from "react-router-dom";
import HeaderNav from "./component/header.jsx";

export default function App() {
  return (
    <>
      <HeaderNav />
      <main style={{ maxWidth: 1100, margin: "30px auto", padding: "0 24px" }}>
        <Outlet />
      </main>
    </>
  );
}
