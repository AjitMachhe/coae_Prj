import { useEffect, useState } from "react";

export default function Countdown({ target }) {
  const t = target.getTime();
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const diff = t - now;
  if (Number.isNaN(diff)) return null;
  if (diff <= 0) return <div className="pb-count-done">This event has started</div>;

  const s = Math.floor(diff / 1000);
  const parts = [
    [Math.floor(s / 86400), "Days"],
    [Math.floor((s % 86400) / 3600), "Hours"],
    [Math.floor((s % 3600) / 60), "Min"],
    [s % 60, "Sec"],
  ];

  return (
    <div className="pb-count">
      {parts.map(([v, label]) => (
        <div key={label}>
          <strong>{String(v).padStart(2, "0")}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}