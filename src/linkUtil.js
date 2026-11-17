export function isAllowedUrl(url) {
  return /^(https?:\/\/|mailto:|tel:|\/)/i.test(url) && !url.startsWith("//");
}

export function isAllowedImage(src) {
  return /^(https?:\/\/|data:image\/)/i.test(src || "");
}

// Turns a saved link object into something a component can render
export function resolveLink(link, pages) {
  if (!link) return null;
  if (link.type === "page") {
    const p = pages.find((x) => x.id === link.pageId);
    return p ? { href: `/${p.slug}`, internal: true } : null;
  }
  if (link.type === "url" && isAllowedUrl(link.url || "")) {
    return {
      href: link.url,
      internal: link.url.startsWith("/"),
      newTab: !!link.newTab,
    };
  }
  return null;
}