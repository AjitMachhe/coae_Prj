import { useEffect, useRef, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { publicLinkStyle } from "../menuStyle";
import MegaPanel from "./MegaPanel";

export default function MegaItem({ item, pages }) {
  const [open, setOpen] = useState(false);
  const [mega, setMega] = useState(null);
  const [failed, setFailed] = useState(false);
  const wrap = useRef(null);
  const timer = useRef(null);
  const fetching = useRef(false);

  // Load the panel content the first time it's needed
  const load = async () => {
    if (mega || failed || fetching.current) return;
    fetching.current = true;
    try {
      const snap = await getDoc(doc(db, "megaMenus", item.id));
      if (snap.exists() && snap.data().enabled) setMega(snap.data());
      else setFailed(true);
    } catch (err) {
      console.error(err);
      setFailed(true);
    }
    fetching.current = false;
  };

  const openNow = () => {
    clearTimeout(timer.current);
    load();
    setOpen(true);
  };

  // Small delay so the panel doesn't vanish while the mouse crosses the gap
  const closeSoon = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setOpen(false), 150);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrap.current && !wrap.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div
      className="mega-item"
      ref={wrap}
      onMouseEnter={openNow}
      onMouseLeave={closeSoon}
    >
      <button
        type="button"
        className="public-link hv mega-trigger"
        style={publicLinkStyle(item.style)}
        aria-expanded={open}
        onClick={openNow}
        onFocus={load}
      >
        {item.label} <span className="caret">▾</span>
      </button>

      {open && mega && (
        <MegaPanel mega={mega} pages={pages} onNavigate={() => setOpen(false)} />
      )}
      {open && !mega && !failed && (
        <div className="mega-panel mega-loading">Loading...</div>
      )}
    </div>
  );
}