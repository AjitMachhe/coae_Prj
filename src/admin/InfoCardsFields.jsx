import ImageField from "./ImageField";
import { emptyInfoCard, MAX_INFO_CARDS, MAX_INFO_FIELDS } from "../blockUtil";

export default function InfoCardsFields({ b, set }) {
  const setCard = (i, patch) =>
    set({ cards: b.cards.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  const setField = (i, k, patch) =>
    setCard(i, { fields: b.cards[i].fields.map((f, j) => (j === k ? { ...f, ...patch } : f)) });

  const moveCard = (i, dir) => {
    const t = i + dir;
    if (t < 0 || t >= b.cards.length) return;
    const c = [...b.cards];
    [c[i], c[t]] = [c[t], c[i]];
    set({ cards: c });
  };

  const removeCard = (i) => {
    if (!window.confirm("Remove this card?")) return;
    set({ cards: b.cards.filter((_, j) => j !== i) });
  };

  return (
    <>
      <label className="mg-row">
        Cards per row
        <select value={b.columns} onChange={(e) => set({ columns: Number(e.target.value) })}>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4</option>
        </select>
      </label>

      {b.cards.map((c, i) => (
        <details className="mg-link" key={i} open>
          <summary>{c.title || `Card ${i + 1}`}</summary>
          <div className="ic-edit">
            <ImageField
              value={c.image}
              onChange={(v) => setCard(i, { image: v })}
              maxWidth={640}
              maxBytes={150000}
            />
            <input
              placeholder="Title (e.g. Appreciation Award)"
              value={c.title}
              onChange={(e) => setCard(i, { title: e.target.value })}
            />

            {c.fields.map((f, k) => (
              <div className="mg-row" key={k}>
                <input
                  placeholder="Label (e.g. Recipient)"
                  value={f.label}
                  onChange={(e) => setField(i, k, { label: e.target.value })}
                />
                <input
                  placeholder="Value"
                  value={f.value}
                  onChange={(e) => setField(i, k, { value: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setCard(i, { fields: c.fields.filter((_, j) => j !== k) })}
                >
                  X
                </button>
              </div>
            ))}
            <div>
              <button
                type="button"
                disabled={c.fields.length >= MAX_INFO_FIELDS}
                onClick={() => setCard(i, { fields: [...c.fields, { label: "", value: "" }] })}
              >
                + Add field ({c.fields.length}/{MAX_INFO_FIELDS})
              </button>
            </div>

            <textarea
              rows={4}
              placeholder="Description"
              value={c.description}
              onChange={(e) => setCard(i, { description: e.target.value })}
            />

            <div className="mg-row">
              <button type="button" onClick={() => moveCard(i, -1)} disabled={i === 0}>▲</button>
              <button type="button" onClick={() => moveCard(i, 1)} disabled={i === b.cards.length - 1}>▼</button>
              <button type="button" onClick={() => removeCard(i)}>Remove card</button>
            </div>
          </div>
        </details>
      ))}

      <div>
        <button
          type="button"
          disabled={b.cards.length >= MAX_INFO_CARDS}
          onClick={() => set({ cards: [...b.cards, emptyInfoCard()] })}
        >
          + Add card ({b.cards.length}/{MAX_INFO_CARDS})
        </button>
      </div>
    </>
  );
}