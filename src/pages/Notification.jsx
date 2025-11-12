// src/pages/Notification.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, Clock, Settings2, HandHeart, CalendarClock, UtensilsCrossed } from "lucide-react";
import { UnreadBus } from "../utils/unreadBus";
import "./Notification.css";

export default function Notification() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [tab, setTab] = useState("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // NEW: pagination state
  const [page, setPage] = useState(1);
  const pageSize = 8;                 // show 8 cards per page (tweak as you like)

  async function loadList() {
    setLoading(true);
    setErr("");
    try {
      const qs = new URLSearchParams({ tab, limit: 200 }); // get up to 200 then page on client
      const res = await fetch(`/api/notifications_list.php?${qs}`, { credentials: "include" });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || "Failed");
      setItems(json.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  // reset to page 1 whenever tab changes
  useEffect(() => { setPage(1); loadList(); }, [tab]);

  // server already filtered by tab; you can add extra local filters here if needed
  const filtered = useMemo(() => items, [items]);

  // slice current page
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const current = filtered.slice(start, start + pageSize);

  const openDetail = (id) => {
    const item = items.find(i => i.id === id);
    if (item && !item.isRead) UnreadBus.dec();
    setItems(list => list.map(i => i.id === id ? { ...i, isRead: true } : i));
    navigate(`/notification/${id}`);
  };

  const markAllAsRead = async () => {
    UnreadBus.clear();
    setItems(list => list.map(i => ({ ...i, isRead: true })));
    await fetch('/api/notifications_mark_all.php', { method:'POST', credentials:'include' });
  };

  const activeIdx = tab === 'all' ? 0 : tab === 'unread' ? 1 : 2;

  return (
    <section className="noti-wrap">
      <h1 className="noti-title">Notification</h1>

      <div className="noti-toolbar">
        <div className="noti-tabs" data-active={activeIdx}>
          <button className={`noti-tab ${tab==="all"?"is-active":""}`} onClick={()=>setTab("all")} type="button">All</button>
          <button className={`noti-tab ${tab==="unread"?"is-active":""}`} onClick={()=>setTab("unread")} type="button">Unread</button>
          <button className={`noti-tab ${tab==="read"?"is-active":""}`} onClick={()=>setTab("read")} type="button">Read</button>
        </div>
        <button className="noti-ghost" onClick={markAllAsRead} type="button">
          <CheckCheck size={16}/> Mark All As Read
        </button>
      </div>

      {err && <div className="noti-error">{err}</div>}
      {loading && <div className="noti-skel">Loading…</div>}

      <div className="noti-list">
        {current.map(n => (
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
        {!loading && current.length===0 && <div className="noti-empty">No notifications.</div>}
      </div>

      {/* Pagination controls */}
      {!loading && total > pageSize && (
        <Pagination
          page={page}
          totalPages={totalPages}
          onGoto={(p) => setPage(p)}
        />
      )}
    </section>
  );
}

function Pagination({ page, totalPages, onGoto }) {
  const canPrev = page > 1;
  const canNext = page < totalPages;

  // build compact page list with ellipsis
  const build = () => {
    if (totalPages <= 7) return [...Array(totalPages)].map((_, i) => i + 1);
    const out = [1];
    const left  = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
    if (left > 2) out.push("…");
    for (let p = left; p <= right; p++) out.push(p);
    if (right < totalPages - 1) out.push("…");
    out.push(totalPages);
    return out;
  };

  const pages = build();

  return (
    <nav className="noti-pager" aria-label="Pagination">
      <button
        className="pager-btn"
        onClick={() => onGoto(1)}
        disabled={!canPrev}
        title="First"
      >
        <span aria-hidden>«</span><span className="sr-only">First</span>
      </button>
      <button
        className="pager-btn"
        onClick={() => onGoto(page - 1)}
        disabled={!canPrev}
        title="Previous"
      >
        <span aria-hidden>‹</span><span className="sr-only">Previous</span>
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`dots-${i}`} className="pager-dots" aria-hidden>…</span>
        ) : (
          <button
            key={p}
            className={"pager-num" + (p === page ? " is-active" : "")}
            onClick={() => onGoto(p)}
            aria-current={p === page ? "page" : undefined}
            title={`Page ${p}`}
          >
            {p}
          </button>
        )
      )}

      <button 
        className="pager-btn" 
        onClick={() => onGoto(page+1)} 
        disabled={page===totalPages} 
        title="Next">
        <span aria-hidden>›</span><span className="sr-only">Next</span>
      </button>
      <button 
        className="pager-btn" 
        onClick={() => onGoto(totalPages)} 
        disabled={page===totalPages} 
        title="Last">
        <span aria-hidden>»</span><span className="sr-only">Last</span>
      </button>
    </nav>
  );
}


function pickIcon(category) {
  switch (category) {
    case "Inventory":
    case "Expiry":    return <CalendarClock size={22}/>;
    case "MealPlan":  return <UtensilsCrossed size={22}/>;
    case "Donation":  return <HandHeart size={22}/>;
    case "System":
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
