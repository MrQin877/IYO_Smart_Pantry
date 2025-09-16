import { BrowserRouter, Routes, Route, NavLink } from "react-router-dom";
import Home from "./pages/Home";
import About from "./pages/About";
import HeaderNav from "./component/header";

const link = ({ isActive }) => ({ marginRight: 12, fontWeight: isActive ? 700 : 400 });

export default function App() {
  return (
    <>
    <HeaderNav/>
    <BrowserRouter basename="/IYO_SMART_PANTRY/frontend/src/pages">
      <nav style={{ padding: 12, borderBottom: "1px solid #eee" }}>
        <NavLink to="/" end style={link}>Home</NavLink>
        <NavLink to="/about" style={link}>About</NavLink>
      </nav>
      <Routes>
        <Route path="/" element={<Home/>} />
        <Route path="/about" element={<About/>} />
      </Routes>
    </BrowserRouter>
    </>
  );
}
