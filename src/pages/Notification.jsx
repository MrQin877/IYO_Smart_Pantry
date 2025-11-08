// src/pages/Notification.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Clock, Settings2, HandHeart, CalendarClock, UtensilsCrossed } from "lucide-react";
import "./Notification.css";

export default function Notification() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function loadList({ cursor, cursor_id } = {}) {
    setLoading(true);
    setErr("");
    const qs = new URLSearchParams({
      tab, limit: 50,
      ...(cursor ? { cursor } : {}),
      ...(cursor_id ? { cursor_id } : {}),
    });
    try {
      const res = await fetch(`/api/notifications_list.php?${qs.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setItems(json.items || []);
      // if you want infinite scroll later, keep next_cursor values from json
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadList(); }, [tab]);

  const filtered = useMemo(() => items, [items]); // server already filtered by tab

  const openDetail = async (id) => {
    // optimistic UI: mark read locally
    setItems(list => list.map(i => i.id === id ? { ...i, isRead: true } : i));
    navigate(`/notification/${id}`); // detail will mark read on server
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch(`/api/notifications_mark_all.php`, { method: "POST", credentials: "include" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setItems(list => list.map(i => ({ ...i, isRead: true })));
    } catch (e) {
      console.error(e);
    }
  };

  const activeIdx = tab === 'all' ? 0 : tab === 'unread' ? 1 : 2;
  
  return (
    <section className="noti-wrap">
      <h1 className="noti-title">Notification</h1>

      {/* Toolbar */}
      <div className="noti-toolbar">
        {/* Tabs with sliding highlight */}
        <div className="noti-tabs" data-active={activeIdx}>
          <button
            className={`noti-tab ${tab === "all" ? "is-active" : ""}`}
            onClick={() => setTab("all")}
            type="button"
          >
            All
          </button>
          <button
            className={`noti-tab ${tab === "unread" ? "is-active" : ""}`}
            onClick={() => setTab("unread")}
            type="button"
          >
            Unread
          </button>
          <button
            className={`noti-tab ${tab === "read" ? "is-active" : ""}`}
            onClick={() => setTab("read")}
            type="button"
          >
            Read
          </button>
        </div>

        <button className="noti-ghost" onClick={markAllAsRead} type="button">
          <CheckCheck size={16} /> Mark All As Read
        </button>
      </div>

      {err && <div className="noti-error">{err}</div>}
      {loading && <div className="noti-skel">Loading…</div>}

      <div className="noti-list">
        {filtered.map(n => (
          <article key={n.id} className="noti-card" role="button" onClick={()=>openDetail(n.id)} style={{cursor:"pointer"}}>
            <div className="noti-card-inner">
              <div className="noti-icon">{pickIcon(n.category)}</div>
              <div className="noti-body">
                <div className="noti-row-top">
                  <h3 className="noti-item-title">
                    {n.title}{!n.isRead && <span className="noti-pill">NEW</span>}
                  </h3>
                  <span className="noti-time"><Clock size={14}/> {timeAgo(n.createdAt)}</span>
                </div>
                <p className="noti-desc">{n.message}</p>
                <div className="noti-row-bottom">
                  <span className="noti-stamp"><CalendarClock size={14}/> {new Date(n.createdAt).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </article>
        ))}
        {!loading && filtered.length===0 && <div className="noti-empty">No notifications.</div>}
      </div>
    </section>
  );
}

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
function timeAgo(ts) {
  const ms = typeof ts === "number" ? ts : new Date(ts).getTime();
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s/60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m/60); if (h < 24) return `${h}h ago`;
  const d = Math.floor(h/24); return d===1 ? "1 day ago" : `${d} days ago`;
}
