import DOMPurify from "dompurify";
import SmartLink from "./SmartLink";
import Countdown from "./Countdown";
import { isAllowedImage, resolveLink } from "../linkUtil";
import { parseVideo, embedSrc } from "../videoUtil";
import { DATE_RE, TIME_RE } from "../blockUtil";
import InfoCards from "./InfoCards";

const HEIGHTS = { small: 240, medium: 360, large: 480 };
const ALIGNS = ["left", "center", "right"];
const alignOf = (a) => (ALIGNS.includes(a) ? a : "left");

function Banner({ b, pages }) {
  const showBtn = b.buttonLabel && resolveLink(b.link, pages);
  return (
    <section
      className="pb-banner"
      style={{
        minHeight: HEIGHTS[b.height] || 360,
        backgroundImage: isAllowedImage(b.image) ? `url(${JSON.stringify(b.image)})` : undefined,
      }}
    >
      <div className="pb-overlay" style={{ background: `rgba(0,0,0,${b.overlay})` }} />
      <div className="pb-banner-text">
        {b.heading && <h1>{b.heading}</h1>}
        {b.subheading && <p>{b.subheading}</p>}
        {showBtn && (
          <SmartLink className="pb-btn filled" link={b.link} pages={pages}>
            {b.buttonLabel}
          </SmartLink>
        )}
      </div>
    </section>
  );
}

function Video({ b }) {
  const v = parseVideo((b.url || "").trim());
  if (!v) return null;
  const auto = !!b.autoplay;
  return (
    <figure className={`pb-video ${b.size === "medium" ? "medium" : "full"}`}>
      <div className="pb-video-frame">
        {v.kind === "file" ? (
          <video src={v.src} controls={!auto} autoPlay={auto} muted={auto} loop={auto} playsInline preload="metadata" />
        ) : (
          <iframe
            src={embedSrc(v, auto)}
            title={b.caption || "Video"}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
            loading="lazy"
          />
        )}
      </div>
      {b.caption && <figcaption>{b.caption}</figcaption>}
    </figure>
  );
}

function fmtTime(t) {
  const [h, m] = t.split(":").map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

function DateTime({ b }) {
  if (!DATE_RE.test(b.date || "")) return null;
  const okTime = TIME_RE.test(b.time || "");
  const okEnd = TIME_RE.test(b.endTime || "");

  const dateText = new Date(`${b.date}T00:00:00`).toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const timeText = okTime
    ? okEnd ? `${fmtTime(b.time)} – ${fmtTime(b.endTime)}` : fmtTime(b.time)
    : "";
  const target = new Date(`${b.date}T${okTime ? b.time : "00:00"}:00`);

  return (
    <div className="pb-dt" style={{ textAlign: alignOf(b.align) }}>
      {b.title && <h3>{b.title}</h3>}
      <div className="pb-dt-line">📅 {dateText}</div>
      {timeText && <div className="pb-dt-line">🕒 {timeText}</div>}
      {b.location && <div className="pb-dt-loc">📍 {b.location}</div>}
      {b.countdown && <Countdown target={target} />}
    </div>
  );
}

function Block({ b, pages }) {
  switch (b.type) {
    case "banner":
      return <Banner b={b} pages={pages} />;

    case "heading": {
      const Tag = b.level === 3 ? "h3" : "h2";
      return <Tag style={{ textAlign: alignOf(b.align) }}>{b.text}</Tag>;
    }

    case "richtext":
      return (
        <div
          className="pb-rich"
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(b.html || "") }}
        />
      );

    case "image":
      if (!isAllowedImage(b.src)) return null;
      return (
        <figure className={`pb-img ${["medium", "small"].includes(b.size) ? b.size : "full"}`}>
          <img src={b.src} alt={b.alt || ""} loading="lazy" />
          {b.caption && <figcaption>{b.caption}</figcaption>}
        </figure>
      );

    case "mediatext": {
      const showBtn = b.buttonLabel && resolveLink(b.link, pages);
      const hasImg = isAllowedImage(b.image);
      return (
        <div className={`pb-mt ${b.side === "right" ? "right" : ""} ${hasImg ? "" : "noimg"}`}>
          {hasImg && (
            <div className="pb-mt-img">
              <img src={b.image} alt={b.heading || ""} loading="lazy" />
            </div>
          )}
          <div className="pb-mt-body">
            {b.heading && <h2>{b.heading}</h2>}
            {b.text && <p>{b.text}</p>}
            {showBtn && (
              <SmartLink className="pb-btn filled" link={b.link} pages={pages}>
                {b.buttonLabel}
              </SmartLink>
            )}
          </div>
        </div>
      );
    }

    case "video":
      return <Video b={b} />;

    case "cards":
      return (
        <div className="pb-cards">
          {(b.cards || []).map((c, i) => {
            const showBtn = c.buttonLabel && resolveLink(c.link, pages);
            return (
              <div className="pb-card" key={i}>
                {isAllowedImage(c.image) && <img src={c.image} alt="" loading="lazy" />}
                <div className="pb-card-body">
                  {c.title && <h3>{c.title}</h3>}
                  {c.text && <p>{c.text}</p>}
                  {showBtn && (
                    <SmartLink className="pb-btn filled small" link={c.link} pages={pages}>
                      {c.buttonLabel}
                    </SmartLink>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    case "infocards":
      return <InfoCards b={b} />;
      
    case "datetime":
      return <DateTime b={b} />;

    case "button":
      return (
        <div style={{ textAlign: alignOf(b.align) }}>
          <SmartLink
            className={`pb-btn ${b.variant === "outline" ? "outline" : "filled"}`}
            link={b.link}
            pages={pages}
          >
            {b.label}
          </SmartLink>
        </div>
      );

    case "spacer":
      return <div style={{ height: Math.min(200, Math.max(0, Number(b.height) || 0)) }} />;

    default:
      return null;
  }
}

export default function BlockRenderer({ blocks, pages }) {
  return (
    <div className="pb">
      {blocks.map((b) => (
        <Block key={b.id} b={b} pages={pages} />
      ))}
    </div>
  );
}