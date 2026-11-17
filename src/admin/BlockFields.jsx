import ImageField from "./ImageField";
import VideoField from "./VideoField";
import LinkField from "./LinkField";
import RichTextField from "./RichTextField";
import { emptyCard, MAX_CARDS } from "../blockUtil";
import InfoCardsFields from "./InfoCardsFields";

export default function BlockFields({ block: b, pages, set }) {
  if (b.type === "banner") {
    return (
      <>
        <ImageField value={b.image} onChange={(v) => set({ image: v })} maxWidth={1400} maxBytes={250000} />
        <input placeholder="Heading" value={b.heading} onChange={(e) => set({ heading: e.target.value })} />
        <input placeholder="Subheading" value={b.subheading} onChange={(e) => set({ subheading: e.target.value })} />
        <label className="mg-row">
          Overlay darkness ({Math.round(b.overlay * 100)}%)
          <input
            type="range" min="0" max="0.8" step="0.05"
            value={b.overlay}
            onChange={(e) => set({ overlay: Number(e.target.value) })}
          />
        </label>
        <label className="mg-row">
          Height
          <select value={b.height} onChange={(e) => set({ height: e.target.value })}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
          </select>
        </label>
        <input
          placeholder="Button label (leave empty for no button)"
          value={b.buttonLabel}
          onChange={(e) => set({ buttonLabel: e.target.value })}
        />
        <LinkField value={b.link} pages={pages} onChange={(v) => set({ link: v })} />
      </>
    );
  }

  if (b.type === "heading") {
    return (
      <>
        <input placeholder="Heading text" value={b.text} onChange={(e) => set({ text: e.target.value })} />
        <div className="mg-row">
          <select value={b.level} onChange={(e) => set({ level: Number(e.target.value) })}>
            <option value={2}>Large (H2)</option>
            <option value={3}>Smaller (H3)</option>
          </select>
          <select value={b.align} onChange={(e) => set({ align: e.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </>
    );
  }

  if (b.type === "richtext") {
    return <RichTextField value={b.html} onChange={(html) => set({ html })} />;
  }

  if (b.type === "image") {
    return (
      <>
        <ImageField value={b.src} onChange={(v) => set({ src: v })} maxWidth={1000} maxBytes={180000} />
        <input placeholder="Alt text (describes the image)" value={b.alt} onChange={(e) => set({ alt: e.target.value })} />
        <input placeholder="Caption (optional)" value={b.caption} onChange={(e) => set({ caption: e.target.value })} />
        <label className="mg-row">
          Size
          <select value={b.size} onChange={(e) => set({ size: e.target.value })}>
            <option value="full">Full width</option>
            <option value="medium">Medium</option>
            <option value="small">Small</option>
          </select>
        </label>
      </>
    );
  }

  if (b.type === "mediatext") {
    return (
      <>
        <ImageField value={b.image} onChange={(v) => set({ image: v })} maxWidth={800} maxBytes={150000} />
        <label className="mg-row">
          Image position
          <select value={b.side} onChange={(e) => set({ side: e.target.value })}>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </label>
        <input placeholder="Heading" value={b.heading} onChange={(e) => set({ heading: e.target.value })} />
        <textarea rows={4} placeholder="Text" value={b.text} onChange={(e) => set({ text: e.target.value })} />
        <input
          placeholder="Button label (optional)"
          value={b.buttonLabel}
          onChange={(e) => set({ buttonLabel: e.target.value })}
        />
        <LinkField value={b.link} pages={pages} onChange={(v) => set({ link: v })} />
      </>
    );
  }

  if (b.type === "video") {
    return (
      <>
        <VideoField value={b.url} onChange={(v) => set({ url: v })} />
        <input placeholder="Caption (optional)" value={b.caption} onChange={(e) => set({ caption: e.target.value })} />
        <div className="mg-row">
          <label className="mg-row">
            Size
            <select value={b.size} onChange={(e) => set({ size: e.target.value })}>
              <option value="full">Full width</option>
              <option value="medium">Medium</option>
            </select>
          </label>
          <label className="lf-tab">
            <input type="checkbox" checked={!!b.autoplay} onChange={(e) => set({ autoplay: e.target.checked })} />
            Autoplay (muted, loops)
          </label>
        </div>
      </>
    );
  }

  if (b.type === "cards") {
    const setCard = (i, patch) =>
      set({ cards: b.cards.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

    return (
      <>
        <div className="mg-cols">
          {b.cards.map((c, i) => (
            <div className="mg-link" key={i}>
              <ImageField value={c.image} onChange={(v) => setCard(i, { image: v })} />
              <input placeholder="Title" value={c.title} onChange={(e) => setCard(i, { title: e.target.value })} />
              <input placeholder="Short text" value={c.text} onChange={(e) => setCard(i, { text: e.target.value })} />
              <input
                placeholder="Button label (optional)"
                value={c.buttonLabel}
                onChange={(e) => setCard(i, { buttonLabel: e.target.value })}
              />
              <LinkField value={c.link} pages={pages} onChange={(v) => setCard(i, { link: v })} />
              <button type="button" onClick={() => set({ cards: b.cards.filter((_, j) => j !== i) })}>
                Remove card
              </button>
            </div>
          ))}
        </div>
        <div>
          <button
            type="button"
            disabled={b.cards.length >= MAX_CARDS}
            onClick={() => set({ cards: [...b.cards, emptyCard()] })}
          >
            + Add card ({b.cards.length}/{MAX_CARDS})
          </button>
        </div>
      </>
    );
  }

    if (b.type === "infocards") {
    return <InfoCardsFields b={b} set={set} />;
  }
  

  if (b.type === "datetime") {
    return (
      <>
        <input placeholder="Title (e.g. Annual Day)" value={b.title} onChange={(e) => set({ title: e.target.value })} />
        <div className="mg-row">
          <label className="mg-row">Date <input type="date" value={b.date} onChange={(e) => set({ date: e.target.value })} /></label>
          <label className="mg-row">Start <input type="time" value={b.time} onChange={(e) => set({ time: e.target.value })} /></label>
          <label className="mg-row">End <input type="time" value={b.endTime} onChange={(e) => set({ endTime: e.target.value })} /></label>
        </div>
        <input placeholder="Location (optional)" value={b.location} onChange={(e) => set({ location: e.target.value })} />
        <div className="mg-row">
          <label className="lf-tab">
            <input type="checkbox" checked={!!b.countdown} onChange={(e) => set({ countdown: e.target.checked })} />
            Show countdown
          </label>
          <select value={b.align} onChange={(e) => set({ align: e.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
        </div>
      </>
    );
  }

  if (b.type === "button") {
    return (
      <>
        <input placeholder="Button label" value={b.label} onChange={(e) => set({ label: e.target.value })} />
        <LinkField value={b.link} pages={pages} onChange={(v) => set({ link: v })} />
        <div className="mg-row">
          <select value={b.align} onChange={(e) => set({ align: e.target.value })}>
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </select>
          <select value={b.variant} onChange={(e) => set({ variant: e.target.value })}>
            <option value="filled">Filled</option>
            <option value="outline">Outline</option>
          </select>
        </div>
      </>
    );
  }

  if (b.type === "spacer") {
    return (
      <label className="mg-row">
        Height (px, 0 to 200)
        <input
          type="number" min="0" max="200"
          value={b.height}
          onChange={(e) => set({ height: e.target.value })}
        />
      </label>
    );
  }

  return null;
}