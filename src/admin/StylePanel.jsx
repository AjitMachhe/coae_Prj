import { useEffect, useState } from "react";
import {
  FONTS, MENU_DEFAULTS, menuOf, mergeStyle, publicLinkStyle,
} from "../menuStyle";

export default function StylePanel({ item, onSave, onClose }) {
  const [draft, setDraft] = useState(mergeStyle(item.style));
  const [status, setStatus] = useState("");

  useEffect(() => {
    setDraft(mergeStyle(item.style));
    setStatus("");
  }, [item.id]);

  const set = (key, value) => {
    setDraft((d) => ({ ...d, [key]: value }));
    setStatus("");
  };

  const save = async () => {
    const size = Math.min(28, Math.max(10, Number(draft.fontSize) || 14));
    try {
      await onSave(item.id, { ...draft, fontSize: size });
      setDraft((d) => ({ ...d, fontSize: size }));
      setStatus("Saved");
    } catch (err) {
      setStatus(err.code || err.message);
    }
  };

  const reset = () => {
    setDraft(mergeStyle(MENU_DEFAULTS[menuOf(item)]));
    setStatus("");
  };

  return (
    <div className="style-panel">
      <div className="style-head">
        <h3>Style: {item.label}</h3>
        <button onClick={onClose}>Close</button>
      </div>

      <label>
        Text color
        <input type="color" value={draft.color} onChange={(e) => set("color", e.target.value)} />
      </label>

      <label>
        No background (transparent)
        <input type="checkbox" checked={!!draft.noBg} onChange={(e) => set("noBg", e.target.checked)} />
      </label>

      <label>
        Background color
        <input
          type="color"
          value={draft.bgColor}
          disabled={!!draft.noBg}
          onChange={(e) => set("bgColor", e.target.value)}
        />
      </label>

      <label>
        Hover text color
        <input type="color" value={draft.hoverColor} onChange={(e) => set("hoverColor", e.target.value)} />
      </label>

      <label>
        Hover background color
        <input type="color" value={draft.hoverBgColor} onChange={(e) => set("hoverBgColor", e.target.value)} />
      </label>

      <label>
        Font
        <select value={draft.fontFamily} onChange={(e) => set("fontFamily", e.target.value)}>
          {FONTS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </label>

      <label>
        Font size (px)
        <input
          type="number" min="10" max="28"
          value={draft.fontSize}
          onChange={(e) => set("fontSize", e.target.value)}
        />
      </label>

      <div className="preview-label">Preview (move your mouse over it)</div>
      <div className="preview-box hv" style={publicLinkStyle(draft, "#8c1515")}>{item.label}</div>

      <div className="style-actions">
        <button className="primary" onClick={save}>Save style</button>
        <button onClick={reset}>Reset to default</button>
        {status && <span className="style-status">{status}</span>}
      </div>
      <p className="hint">Reset only changes the preview. Click Save style to apply it.</p>
    </div>
  );
}