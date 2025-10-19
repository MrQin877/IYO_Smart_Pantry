import { Link } from "react-router-dom";
import "./home.css";

export default function Home() {
  return (
    <div className="hp">
      <div className="hp-frame">
        {/* background tint + dots */}
        <div className="hero-bg" aria-hidden="true" />
        <img src="/HomePageDot.svg" alt="" aria-hidden="true" className="dots-img" />

        <section className="hero-wrap">
          <div className="hero-inner">
            <div className="hero-col hero-text">
              <h1 className="hero-script">
                <span>Save Food,</span>
                <span>Share Meals,</span>
                <span>Strengthen Community</span>
              </h1>

              <p className="hero-sub">
                “Smart Pantry helps you track, plan, and donate with ease — making every meal matter.”
              </p>

              <div className="hero-cta">
                <Link to="/register" className="btn-start">Get Started</Link>
                <Link to="/login" className="btn-login">Login</Link>
              </div>
            </div>

            <div className="hero-col hero-art">
              <div className="art-stage">
                <div className="art-vignette" aria-hidden="true" />
                <div className="art-disc outer" />
                <div className="art-disc inner" />
                <img src="/HomePageFork.svg" alt="" className="art-img" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
