import { Outlet } from "react-router-dom";
import HeaderNav from "./component/header.jsx";

export default function App() {
  return (
    <>
      <HeaderNav />
      <main style={{ maxWidth: 1100, margin: "16px auto", padding: "0 16px" }}>
        <Outlet />
      </main>
    </>
  );
}
