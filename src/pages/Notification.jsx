import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell, CheckCheck, Clock, Settings2, HandHeart, CalendarClock, UtensilsCrossed
} from "lucide-react";
import { demoNotifications, getNotificationById } from "./demoNotifications.js";
import "./Notification.css";

export default function Notification() {
  const navigate = useNavigate();

  const [items, setItems] = useState(
    demoNotifications.map(n => ({
      id: n.id,
      title: n.title,
      message: n.message,
      createdAt: n.createdAt,   // ISO
      isRead: n.isRead,
      category: n.category,     // "Expiry" | "Inventory" | "MealPlan" | "Donation" | "System" | "Account"
    }))
  );

  const [tab, setTab] = useState("all");
  const filtered = useMemo(() => {
    if (tab === "unread") return items.filter(i => !i.isRead);
    if (tab === "read")   return items.filter(i =>  i.isRead);
    return items;
  }, [items, tab]);

  const openDetail = (id) => {
    // Optimistically mark as read in list
    setItems(list => list.map(i => i.id === id ? { ...i, isRead: true } : i));
    // Pass full object via route state
    const detail = getNotificationById(id);
    navigate(`/notification/${id}`, { state: { detail } });
  };

  const markAllAsRead = () =>
    setItems(list => list.map(i => ({ ...i, isRead: true })));

  return (
    <section className="noti-wrap">
      <h1 className="noti-title">Notification</h1>

      <div className="noti-toolbar">
        <div className="noti-tabs">
          <button className={`noti-tab ${tab==='all'?'is-active':''}`} onClick={()=>setTab('all')}>All</button>
          <button className={`noti-tab ${tab==='unread'?'is-active':''}`} onClick={()=>setTab('unread')}>Unread</button>
          <button className={`noti-tab ${tab==='read'?'is-active':''}`} onClick={()=>setTab('read')}>Read</button>
        </div>
        <button className="noti-ghost" onClick={markAllAsRead}>
          <CheckCheck size={16} /> Mark All As Read
        </button>
      </div>

      <div className="noti-list">
        {filtered.map(n => (
          <article
            key={n.id}
            className="noti-card"
            role="button"
            onClick={() => openDetail(n.id)}
            style={{ cursor: "pointer" }}
          >
            <div className="noti-card-inner">
              <div className="noti-icon">{pickIcon(n.category)}</div>

              <div className="noti-body">
                <div className="noti-row-top">
                  <h3 className="noti-item-title">
                    {n.title}
                    {!n.isRead && <span className="noti-pill">NEW</span>}
                  </h3>
                  <span className="noti-time">
                    <Clock size={14}/> {timeAgo(n.createdAt)}
                  </span>
                </div>

                <p className="noti-desc">{n.message}</p>

                <div className="noti-row-bottom">
                  <span className="noti-stamp">
                    <CalendarClock size={14}/> {new Date(n.createdAt).toLocaleString()}
                  </span>
                  {/* removed per-item read/unread button */}
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* Category → icon */
function pickIcon(category) {
  switch (category) {
    case "Inventory": return <CalendarClock size={22}/>;
    case "Expiry":    return <CalendarClock size={22}/>;
    case "MealPlan":  return <UtensilsCrossed size={22}/>;
    case "Donation":  return <HandHeart size={22}/>;
    case "System":    return <Settings2 size={22}/>;
    case "Account":   return <Settings2 size={22}/>;
    default:          return <Bell size={22}/>;
  }
}

/* Robust time-ago for ISO or numbers */
function timeAgo(ts) {
  const ms = typeof ts === "number" ? ts : new Date(ts).getTime();
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24); return d === 1 ? "1 day ago" : `${d} days ago`;
}
