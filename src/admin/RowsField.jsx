import ImageField from "./ImageField";

export default function RowsField({ label, rows, onChange, columns, max = 20, addLabel = "+ Add" }) {
  const blank = () => Object.fromEntries(columns.map((c) => [c.key, ""]));

  const setRow = (i, key, value) =>
    onChange(rows.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  const move = (i, dir) => {
    const to = i + dir;
    if (to < 0 || to >= rows.length) return;
    const c = [...rows];
    [c[i], c[to]] = [c[to], c[i]];
    onChange(c);
  };

  return (
    <div className="rf">
      {label && <div className="rf-label">{label}</div>}

      {rows.map((r, i) => (
        <div className="mg-link" key={i}>
          {columns.map((c) => {
            if (c.type === "image") {
              return (
                <ImageField
                  key={c.key}
                  value={r[c.key]}
                  onChange={(v) => setRow(i, c.key, v)}
                  maxWidth={c.maxWidth || 640}
                  maxBytes={150000}
                />
              );
            }
            if (c.type === "textarea") {
              return (
                <textarea
                  key={c.key}
                  rows={3}
                  placeholder={c.placeholder}
                  value={r[c.key] || ""}
                  onChange={(e) => setRow(i, c.key, e.target.value)}
                />
              );
            }
            return (
              <input
                key={c.key}
                placeholder={c.placeholder}
                value={r[c.key] || ""}
                onChange={(e) => setRow(i, c.key, e.target.value)}
              />
            );
          })}
          <div className="mg-row">
            <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>▲</button>
            <button type="button" onClick={() => move(i, 1)} disabled={i === rows.length - 1}>▼</button>
            <button type="button" onClick={() => onChange(rows.filter((_, j) => j !== i))}>Remove</button>
          </div>
        </div>
      ))}

      <div>
        <button type="button" disabled={rows.length >= max} onClick={() => onChange([...rows, blank()])}>
          {addLabel} ({rows.length}/{max})
        </button>
      </div>
    </div>
  );
}