import { useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
  ArrowLeft, CalendarClock, MapPin, Clock, Package, HandHeart, Settings2, ShieldCheck
} from "lucide-react";
import "./Notification.css";
import { getNotificationById } from "./demoNotifications.js";

/**
 * Expected API payload (example):
 * {
 *   id: 123,
 *   category: "Expiry" | "Inventory" | "MealPlan" | "Donation" | "System" | "Account",
 *   title: "Inventory Reminder",
 *   message: "Item Pasta is expiring soon",
 *   createdAt: "2025-10-24T12:34:56Z",
 *   item: { name, quantity, unit, expiryISO, storageLocation, categoryID?, unitID? },
 *   donation?: { location, slots: [{date:"YYYY-MM-DD", from:"HH:MM", to:"HH:MM"}] },
 *   mealPlan?: { dateISO:"YYYY-MM-DD", planTitle?, notes? },
 *   account?: { change: "2FA Setting on" }
 * }
 */

export default function NotificationDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const loc = useLocation();

  const [detail, setDetail] = useState(null);

  useEffect(() => {
    // If list passed a preloaded object via route state, use it.
    const preload = loc.state?.detail;
    if (preload && String(preload.id) === String(id)) {
      setDetail(preload);
      return;
    }
    const local = getNotificationById(id);
    if (local) {
        setDetail(local);
        return;
    }
    // Otherwise fetch from backend
    /*(async () => {
      const res = await fetch(`/api/notification_detail.php?id=${id}`);
      const json = await res.json();
      if (json?.ok) setDetail(json.data);
    })();*/
  }, [id]);

  const back = () => navigate(-1);

  const planForMeal = () => {
    if (!detail?.item) return;
    navigate("/plan", {
      state: {
        from: "notification",
        notificationId: id,
        item: {
          name: detail.item.name,
          qty: detail.item.quantity,
          unit: detail.item.unit,
          expiry: detail.item.expiryISO,
          storage: detail.item.storageLocation,
          categoryID: detail.item.categoryID ?? null,
          unitID: detail.item.unitID ?? null,
        },
      },
    });
  };

  const donate = () => {
    if (!detail?.item) return;
    navigate("/food/donation", {
      state: {
        from: "notification",
        notificationId: id,
        item: {
          name: detail.item.name,
          quantity: Number(detail.item.quantity || 0),
          unit: detail.item.unit,
          unitID: detail.item.unitID ?? null,
          expiryISO: detail.item.expiryISO,
          categoryID: detail.item.categoryID ?? null,
          storageLocation: detail.item.storageLocation,
        },
      },
    });
  };

  if (!detail) {
    return (
      <section className="nd-wrap">
        <button className="nd-back" onClick={back}><ArrowLeft size={20}/><span>Back</span></button>
        <article className="nd-card"><div className="nd-skel" /></article>
      </section>
    );
  }

  const { category } = detail;

  return (
    <section className="nd-wrap">
      <button className="nd-back" onClick={back}><ArrowLeft size={20}/><span>Back</span></button>

      <article className="nd-card">
        <header className="nd-header">
          <h1 className="nd-title">{detail.title}</h1>
        </header>

        <p className="nd-message">{detail.message}</p>

        {/* Common timestamp */}
        <p className="nd-stamp">
          <CalendarClock size={16}/> {formatDateTime(detail.createdAt)}
        </p>

        {/* Category-specific sections */}
        {category === "Expiry" && <ExpirySection detail={detail} onPlan={planForMeal} onDonate={donate} />}
        {category === "Inventory" && <InventorySection detail={detail} />}
        {category === "MealPlan" && <MealPlanSection detail={detail} onGoPlan={planForMeal} />}
        {category === "Donation" && <DonationSection detail={detail} />}
        {category === "System" && <SystemSection detail={detail} />}
        {category === "Account" && <AccountSection detail={detail} />}
      </article>
    </section>
  );
}

/* ---- Category sections ---- */

function ExpirySection({ detail, onPlan, onDonate }) {
  const it = detail.item || {};
  return (
    <>
      <h2 className="nd-subtitle">Item detail</h2>
      <DL rows={[
        ["Name:", it.name],
        ["Quantity", `${it.quantity ?? ""} ${it.unit ?? ""}`.trim()],
        ["Expiry date:", it.expiryISO],
        ["Storage Location:", it.storageLocation],
      ]} />
      <p className="nd-note">Use it or donate before expired!</p>
      <div className="nd-cta">
        <button className="nd-btn" onClick={onPlan}><Package size={16}/> Plan for Meal</button>
        <button className="nd-btn" onClick={onDonate}><HandHeart size={16}/> Donate</button>
      </div>
    </>
  );
}

function InventorySection({ detail }) {
  const it = detail.item || {};
  return (
    <>
      <h2 className="nd-subtitle">New food added</h2>
      <DL rows={[
        ["Name:", it.name],
        ["Quantity", `${it.quantity ?? ""} ${it.unit ?? ""}`.trim()],
        ["Expiry date:", it.expiryISO || "—"],
        ["Storage Location:", it.storageLocation || "—"],
      ]} />
      <div className="nd-cta">
        <button className="nd-btn" onClick={() => history.back()}>OK</button>
      </div>
    </>
  );
}

function MealPlanSection({ detail, onGoPlan }) {
  const mp = detail.mealPlan || {};
  return (
    <>
      <h2 className="nd-subtitle">Today’s plan</h2>
      <DL rows={[
        ["Plan", mp.planTitle || "Meal plan"],
        ["Date", mp.dateISO],
        ["Notes", mp.notes || "—"],
      ]} />
      <p className="nd-note">It’s your planned meal day — don’t forget to prepare it!</p>
      <div className="nd-cta">
        <button className="nd-btn" onClick={onGoPlan}><Clock size={16}/> View Plan</button>
      </div>
    </>
  );
}

function DonationSection({ detail }) {
  const it = detail.item || {};
  const dn = detail.donation || {};
  const slots = Array.isArray(dn.slots) ? dn.slots : [];
  return (
    <>
      <h2 className="nd-subtitle">Donated item</h2>
      <DL rows={[
        ["Name:", it.name],
        ["Quantity", `${it.quantity ?? ""} ${it.unit ?? ""}`.trim()],
        ["Expiry date", it.expiryISO || "—"],
      ]} />

      <h3 className="nd-subsubtitle">Pickup</h3>
      <div className="nd-pickup">
        <span className="nd-inline"><MapPin size={16}/> {dn.location || "—"}</span>
        <div className="nd-slots">
          {slots.map((s, i) => (
            <span key={i} className="nd-chip">{s.date} • {s.from}–{s.to}</span>
          ))}
          {slots.length === 0 && <span className="nd-chip nd-chip-muted">No slot</span>}
        </div>
      </div>

      <div className="nd-cta">
        <button className="nd-btn" onClick={() => window.location.assign("/food/donation")}>
          Manage Donation
        </button>
      </div>
    </>
  );
}

function SystemSection({ detail }) {
  return (
    <>
      <h2 className="nd-subtitle nd-inline"><Settings2 size={16}/> System</h2>
      <p className="nd-note">Welcome aboard! Your account is ready.</p>
      <div className="nd-cta">
        <button className="nd-btn" onClick={() => window.location.assign("/dashboard")}>Go to Dashboard</button>
      </div>
    </>
  );
}

function AccountSection({ detail }) {
  const change = detail.account?.change || "Account setting updated";
  return (
    <>
      <h2 className="nd-subtitle nd-inline"><ShieldCheck size={16}/> Account Change</h2>
      <DL rows={[["Change", change]]} />
      <div className="nd-cta">
        <button className="nd-btn" onClick={() => window.location.assign("/settings")}>Open Settings</button>
      </div>
    </>
  );
}

/* ---- Small helpers ---- */

function DL({ rows }) {
  return (
    <dl className="nd-dl">
      {rows.map(([k, v], i) => (
        <div className="nd-row" key={i}>
          <dt>{k}</dt><dd>{v || "—"}</dd>
        </div>
      ))}
    </dl>
  );
}

function formatDateTime(ts) {
  try {
    const d = new Date(ts);
    return d.toLocaleString();
  } catch {
    return String(ts || "");
  }
}
