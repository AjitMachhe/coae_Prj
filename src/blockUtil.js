import { isAllowedUrl, isAllowedImage } from "./linkUtil";
import { parseVideo } from "./videoUtil";

export const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
export const TIME_RE = /^\d{2}:\d{2}$/;

export const emptyLink = () => ({ type: "none", pageId: "", url: "", newTab: false });

export function cleanLink(l) {
  const v = { ...emptyLink(), ...(l || {}) };
  if (v.type === "page") return { type: "page", pageId: v.pageId };
  if (v.type === "url") return { type: "url", url: v.url.trim(), newTab: !!v.newTab };
  return { type: "none" };
}

export function linkProblem(l) {
  const v = { ...emptyLink(), ...(l || {}) };
  if (v.type === "page" && !v.pageId) return "choose a page";
  if (v.type === "url" && !isAllowedUrl(v.url.trim())) {
    return "URL must start with https://, http://, mailto:, tel: or /";
  }
  return "";
}

const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : String(Date.now()) + Math.random().toString(16).slice(2);

export const BLOCK_TYPES = [
  { type: "banner", label: "Banner" },
  { type: "heading", label: "Heading" },
  { type: "richtext", label: "Text" },
  { type: "image", label: "Image" },
  { type: "mediatext", label: "Image + text" },
  { type: "video", label: "Video" },
  { type: "cards", label: "Cards" },
  { type: "infocards", label: "Info cards (popup)" },
  { type: "datetime", label: "Date & time" },
  { type: "button", label: "Button" },
  { type: "spacer", label: "Spacer" },
];

export const MAX_CARDS = 4;
export const MAX_INFO_CARDS = 30;
export const MAX_INFO_FIELDS = 4;

export const emptyCard = () => ({
  image: "", title: "", text: "", buttonLabel: "", link: emptyLink(),
});

export const emptyInfoCard = () => ({
  image: "", title: "", fields: [{ label: "", value: "" }], description: "",
});

export function newBlock(type) {
  const id = uid();
  switch (type) {
    case "banner":
      return { id, type, image: "", heading: "", subheading: "", overlay: 0.4, height: "medium", buttonLabel: "", link: emptyLink() };
    case "heading":
      return { id, type, text: "", level: 2, align: "left" };
    case "richtext":
      return { id, type, html: "" };
    case "image":
      return { id, type, src: "", alt: "", caption: "", size: "full" };
    case "mediatext":
      return { id, type, image: "", side: "left", heading: "", text: "", buttonLabel: "", link: emptyLink() };
    case "video":
      return { id, type, url: "", caption: "", size: "full", autoplay: false };
    case "cards":
      return { id, type, cards: [emptyCard(), emptyCard()] };
    case "infocards":
      return { id, type, columns: 3, cards: [emptyInfoCard()] };
    case "datetime":
      return { id, type, title: "", date: "", time: "", endTime: "", location: "", countdown: false, align: "center" };
    case "button":
      return { id, type, label: "", link: emptyLink(), align: "left", variant: "filled" };
    case "spacer":
      return { id, type, height: 40 };
    default:
      return null;
  }
}

// Fill in any missing fields on blocks loaded from the database
export function normalizeBlocks(arr) {
  return arr
    .map((b) => {
      const base = newBlock(b.type);
      if (!base) return null;
      const merged = { ...base, ...b };
      if (merged.type === "cards") {
        merged.cards = (b.cards || []).map((c) => ({
          ...emptyCard(), ...c, link: { ...emptyLink(), ...(c.link || {}) },
        }));
      }
      if (merged.type === "infocards") {
        merged.cards = (b.cards || []).map((c) => ({
          ...emptyInfoCard(), ...c,
          fields: (c.fields || []).map((f) => ({ label: "", value: "", ...f })),
        }));
      }
      if (merged.link) merged.link = { ...emptyLink(), ...merged.link };
      return merged;
    })
    .filter(Boolean);
}

export function cleanBlocks(blocks) {
  return blocks
    .map((b) => {
      const id = b.id;
      switch (b.type) {
        case "banner":
          return {
            id, type: "banner", image: b.image || "",
            heading: b.heading.trim(), subheading: b.subheading.trim(),
            overlay: Number(b.overlay) || 0, height: b.height,
            buttonLabel: b.buttonLabel.trim(), link: cleanLink(b.link),
          };
        case "heading":
          return { id, type: "heading", text: b.text.trim(), level: b.level === 3 ? 3 : 2, align: b.align };
        case "richtext":
          return { id, type: "richtext", html: b.html || "" };
        case "image":
          return { id, type: "image", src: b.src || "", alt: b.alt.trim(), caption: b.caption.trim(), size: b.size };
        case "mediatext":
          return {
            id, type: "mediatext", image: b.image || "",
            side: b.side === "right" ? "right" : "left",
            heading: b.heading.trim(), text: b.text.trim(),
            buttonLabel: b.buttonLabel.trim(), link: cleanLink(b.link),
          };
        case "video":
          return {
            id, type: "video", url: b.url.trim(), caption: b.caption.trim(),
            size: b.size === "medium" ? "medium" : "full", autoplay: !!b.autoplay,
          };
        case "cards":
          return {
            id, type: "cards",
            cards: b.cards.map((c) => ({
              image: c.image || "", title: c.title.trim(), text: c.text.trim(),
              buttonLabel: c.buttonLabel.trim(), link: cleanLink(c.link),
            })),
          };
        case "infocards":
          return {
            id, type: "infocards",
            columns: [2, 3, 4].includes(Number(b.columns)) ? Number(b.columns) : 3,
            cards: b.cards.map((c) => ({
              image: c.image || "",
              title: c.title.trim(),
              fields: c.fields
                .map((f) => ({ label: f.label.trim(), value: f.value.trim() }))
                .filter((f) => f.label || f.value),
              description: c.description.trim(),
            })),
          };
        case "datetime":
          return {
            id, type: "datetime", title: b.title.trim(), date: b.date || "",
            time: b.time || "", endTime: b.endTime || "", location: b.location.trim(),
            countdown: !!b.countdown, align: b.align,
          };
        case "button":
          return { id, type: "button", label: b.label.trim(), link: cleanLink(b.link), align: b.align, variant: b.variant };
        case "spacer":
          return { id, type: "spacer", height: Math.min(200, Math.max(0, Number(b.height) || 0)) };
        default:
          return null;
      }
    })
    .filter(Boolean);
}

const imageBad = (src) => src && !isAllowedImage(src);

function buttonProblem(label, link) {
  if (!label.trim()) return "";
  if (!link || link.type === "none") return "the button needs a link";
  const e = linkProblem(link);
  return e ? `button: ${e}` : "";
}

export function validateBlocks(blocks) {
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const w = `Block ${i + 1} (${b.type})`;

    if (b.type === "banner") {
      if (imageBad(b.image)) return `${w}: image must be an https:// URL or an upload`;
      const e = buttonProblem(b.buttonLabel, b.link);
      if (e) return `${w}: ${e}`;
    }
    if (b.type === "image") {
      if (!b.src) return `${w}: choose an image`;
      if (imageBad(b.src)) return `${w}: image must be an https:// URL or an upload`;
    }
    if (b.type === "mediatext") {
      if (imageBad(b.image)) return `${w}: image must be an https:// URL or an upload`;
      const e = buttonProblem(b.buttonLabel, b.link);
      if (e) return `${w}: ${e}`;
    }
    if (b.type === "video") {
      if (!b.url.trim()) return `${w}: paste a video link or upload a video`;
      if (!parseVideo(b.url.trim())) return `${w}: not a valid https:// video link`;
    }
    if (b.type === "infocards") {
      if (!b.cards.length) return `${w}: add at least one card`;
      for (let c = 0; c < b.cards.length; c++) {
        const card = b.cards[c];
        if (!card.title.trim()) return `${w}, card ${c + 1}: title is required`;
        if (imageBad(card.image)) return `${w}, card ${c + 1}: image must be an https:// URL or an upload`;
      }
    }
    if (b.type === "datetime") {
      if (!DATE_RE.test(b.date || "")) return `${w}: choose a date`;
      if (b.time && !TIME_RE.test(b.time)) return `${w}: start time is not valid`;
      if (b.endTime && !TIME_RE.test(b.endTime)) return `${w}: end time is not valid`;
    }
    if (b.type === "cards") {
      for (let c = 0; c < b.cards.length; c++) {
        const card = b.cards[c];
        if (imageBad(card.image)) return `${w}, card ${c + 1}: image must be an https:// URL or an upload`;
        const e = buttonProblem(card.buttonLabel, card.link);
        if (e) return `${w}, card ${c + 1}: ${e}`;
      }
    }
    if (b.type === "button") {
      if (!b.label.trim()) return `${w}: button label is required`;
      if (!b.link || b.link.type === "none") return `${w}: the button needs a link`;
      const e = linkProblem(b.link);
      if (e) return `${w}: ${e}`;
    }
  }

  const size = JSON.stringify(blocks).length;
  if (size > 850000) {
    return `This page is about ${Math.round(size / 1024)} KB, over the ~830 KB limit. Images stored inside the page are the usual cause: set up cloud uploads or use hosted image URLs.`;
  }
  return "";
}