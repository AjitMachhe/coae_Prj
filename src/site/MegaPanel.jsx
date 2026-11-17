import SmartLink from "./SmartLink";
import { isAllowedImage, resolveLink } from "../linkUtil";

export default function MegaPanel({ mega, pages, onNavigate }) {
  const cols = mega.columns || [];
  const f = mega.featured;
  const showFeatured = f && f.enabled;
  const showButton = showFeatured && f.buttonLabel && resolveLink(f.link, pages);

  return (
    <div
      className="mega-panel"
      style={{ background: mega.bg, color: mega.text, "--accent": mega.accent }}
    >
      <div className="mega-inner">
        <div
          className="mega-cols"
          style={{ gridTemplateColumns: `repeat(${Math.max(cols.length, 1)}, minmax(0, 1fr))` }}
        >
          {cols.map((c, i) => (
            <div key={i} className="mega-col">
              {c.title && <h4 style={{ color: mega.accent }}>{c.title}</h4>}
              <ul>
                {(c.links || []).map((l, j) => (
                  <li key={j}>
                    <SmartLink
                      link={l.link}
                      pages={pages}
                      onClick={onNavigate}
                      style={{ color: mega.text }}
                    >
                      {l.label}
                    </SmartLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {showFeatured && (
          <aside className="mega-featured">
            {isAllowedImage(f.image) && (
              <div className="mega-img">
                <img src={f.image} alt={f.title || ""} />
              </div>
            )}
            {f.title && <h4>{f.title}</h4>}
            {f.text && <p>{f.text}</p>}
            {showButton && (
              <SmartLink
                className="mega-btn"
                link={f.link}
                pages={pages}
                onClick={onNavigate}
                style={{ background: mega.accent }}
              >
                {f.buttonLabel}
              </SmartLink>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}