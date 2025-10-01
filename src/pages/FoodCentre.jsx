import { NavLink, Outlet } from "react-router-dom";
import "./FoodCentre.css"; // keep your styles here

export default function FoodCentre() {
  return (
    <section className="fc">
      <div className="card">
        {/* Segmented tabs */}
        <div className="seg">
          <NavLink
            end
            to="."
            className={({ isActive }) => "seg__btn" + (isActive ? " is-active" : "")}
          >
            My Food
          </NavLink>
          <NavLink
            to="donation"
            className={({ isActive }) => "seg__btn" + (isActive ? " is-active" : "")}
          >
            Donation
          </NavLink>
        </div>

        {/* Child routes render here */}
        <Outlet />
      </div>
    </section>
  );
}
