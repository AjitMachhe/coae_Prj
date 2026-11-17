import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { isAllowedImage } from "../linkUtil";

// Whole photo on top of a blurred copy of itself
function Media({ src, alt, big }) {
  if (!isAllowedImage(src)) return null;
  return (
    <div className={`ic-img${big ? " big" : ""}`}>
      <div className="ic-img-bg" style={{ backgroundImage: `url(${JSON.stringify(src)})` }} />
      <img src={src} alt={alt || ""} loading="lazy" />
    </div>
  );
}

function Details({ card, full }) {
  return (
    <>
      <span className="ic-rule" />
      <h3 className="ic-title">{card.title}</h3>
      {(card.fields || []).map((f, i) => (
        <p className="ic-field" key={i}>
          {f.label && (
            <strong>
              {f.label.replace(/:\s*$/, "")}
              {f.value ? ":" : ""}{" "}
            </strong>
          )}
          {f.value}
        </p>
      ))}
      {card.description && (
        <p className={full ? "ic-desc" : "ic-desc clamp"}>{card.description}</p>
      )}
    </>
  );
}

function Modal({ cards, index, onChange, onClose }) {
  const card = cards[index];
  const last = cards.length - 1;
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  // Lock page scroll while open, and move focus into the popup
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (closeRef.current) closeRef.current.focus();
    return () => { document.body.style.overflow = prev; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight" && index < last) onChange(index + 1);
      else if (e.key === "ArrowLeft" && index > 0) onChange(index - 1);
      else if (e.key === "Tab" && dialogRef.current) {
        const f = dialogRef.current.querySelectorAll("button:not([disabled])");
        if (!f.length) return;
        const first = f[0];
        const lastEl = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [index, last, onChange, onClose]);

  const hasImg = isAllowedImage(card.image);

  return createPortal(
    <div
      className="ic-overlay"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="ic-dialog" role="dialog" aria-modal="true" aria-label={card.title} ref={dialogRef}>
        <button className="ic-close" ref={closeRef} onClick={onClose} aria-label="Close">✕</button>

        <div className={`ic-modal-body${hasImg ? "" : " noimg"}`}>
          <Media src={card.image} alt={card.title} big />
          <div className="ic-modal-text">
            <Details card={card} full />
          </div>
        </div>

        {cards.length > 1 && (
          <div className="ic-nav">
            <button onClick={() => onChange(index - 1)} disabled={index === 0}>‹ Previous</button>
            <span>{index + 1} / {cards.length}</span>
            <button onClick={() => onChange(index + 1)} disabled={index === last}>Next ›</button>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

export default function InfoCards({ b }) {
  const cards = (b.cards || []).filter((c) => c.title || c.image);
  const [open, setOpen] = useState(null);
  const trigger = useRef(null);
  const cols = [2, 3, 4].includes(Number(b.columns)) ? Number(b.columns) : 3;

  const openCard = (i, el) => {
    trigger.current = el;
    setOpen(i);
  };

  // Give focus back to the card that was clicked
  const close = useCallback(() => {
    setOpen(null);
    if (trigger.current) trigger.current.focus();
  }, []);

  return (
    <>
      <div className="ic-grid" style={{ "--ic-cols": cols }}>
        {cards.map((c, i) => (
          <div
            key={i}
            className="ic-card"
            role="button"
            tabIndex={0}
            aria-haspopup="dialog"
            onClick={(e) => openCard(i, e.currentTarget)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openCard(i, e.currentTarget);
              }
            }}
          >
            <Media src={c.image} alt={c.title} />
            <div className="ic-body">
              <Details card={c} />
            </div>
          </div>
        ))}
      </div>

      {open !== null && cards[open] && (
        <Modal cards={cards} index={open} onChange={setOpen} onClose={close} />
      )}
    </>
  );
}