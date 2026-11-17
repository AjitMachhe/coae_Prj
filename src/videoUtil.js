export function parseVideo(url) {
  if (!url || !/^https:\/\//i.test(url)) return null;
  let u;
  try { u = new URL(url); } catch { return null; }
  const host = u.hostname.replace(/^www\./, "");

  if (host === "youtu.be" || host === "youtube.com" || host === "m.youtube.com") {
    let id = null;
    if (host === "youtu.be") id = u.pathname.slice(1).split("/")[0];
    else if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(embed|shorts|live)\/([^/?]+)/);
      if (m) id = m[2];
    }
    return id && /^[A-Za-z0-9_-]{6,20}$/.test(id) ? { kind: "youtube", id } : null;
  }

  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(\d{5,})/);
    return m ? { kind: "vimeo", id: m[1] } : null;
  }

  return { kind: "file", src: url };
}

export function embedSrc(v, autoplay) {
  if (v.kind === "youtube") {
    const base = `https://www.youtube-nocookie.com/embed/${v.id}?rel=0`;
    return autoplay ? `${base}&autoplay=1&mute=1&loop=1&playlist=${v.id}` : base;
  }
  const base = `https://player.vimeo.com/video/${v.id}`;
  return autoplay ? `${base}?autoplay=1&muted=1&loop=1` : base;
}