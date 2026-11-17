export const FONTS = [
  { label: "System", value: "system-ui, sans-serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Poppins", value: "'Poppins', sans-serif" },
  { label: "Playfair Display", value: "'Playfair Display', serif" },
  { label: "Roboto Mono", value: "'Roboto Mono', monospace" },
];

export const DEFAULT_STYLE = {
  color: "#ffffff",
  bgColor: "#374151",
  noBg: false,
  hoverColor: "#ffffff",
  hoverBgColor: "#2563eb",
  fontFamily: FONTS[0].value,
  fontSize: 14,
};

// Starting styles for NEW items, by menu
export const MENU_DEFAULTS = {
  top: {
    color: "#ffffff", bgColor: "#8f1a1a", noBg: false,
    hoverColor: "#ffffff", hoverBgColor: "#a82020",
    fontFamily: FONTS[0].value, fontSize: 13,
  },
  main: {
    color: "#ffffff", bgColor: "#8c1515", noBg: true,
    hoverColor: "#ffffff", hoverBgColor: "#6e1010",
    fontFamily: FONTS[0].value, fontSize: 15,
  },
};

// Items created before this step have no "menu" field: they are the top bar
export const menuOf = (item) => item.menu || "top";

export function mergeStyle(style) {
  return { ...DEFAULT_STYLE, ...(style || {}) };
}

// Inline style for the admin list. fallbackBg is shown when "no background" is on
export function styleToCss(style, fallbackBg = "transparent") {
  const s = mergeStyle(style);
  return {
    color: s.color,
    backgroundColor: s.noBg ? fallbackBg : s.bgColor,
    fontFamily: s.fontFamily,
    fontSize: s.fontSize + "px",
  };
}

// CSS variables so the stylesheet :hover rule can switch colors
export function publicLinkStyle(style, fallbackBg = "transparent") {
  const s = mergeStyle(style);
  return {
    "--c": s.color,
    "--bg": s.noBg ? fallbackBg : s.bgColor,
    "--hc": s.hoverColor,
    "--hbg": s.hoverBgColor,
    fontFamily: s.fontFamily,
    fontSize: s.fontSize + "px",
  };
}