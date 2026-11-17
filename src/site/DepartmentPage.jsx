import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { isAllowedImage } from "../linkUtil";

function Section({ title, alt, children }) {
  return (
    <section className={`tp-sec${alt ? " alt" : ""}`}>
      <div className="tp-inner">
        {title && <h2 className="tp-h">{title}</h2>}
        {children}
      </div>
    </section>
  );
}

export default function DepartmentPage({ page, pages }) {
  const d = page.data || {};
  const stats = d.stats || [];
  const programs = d.programs || [];
  const facilities = d.facilities || [];

  const faculty = pages
    .filter(
      (p) =>
        p.status === "published" &&
        p.template === "faculty" &&
        p.data &&
        p.data.departmentId === page.id
    )
    .sort((a, b) => a.title.localeCompare(b.title));

  const hasAbout = d.about && d.about.replace(/<[^>]*>/g, "").trim();
  const hasHod = d.hodName || d.hodMessage;
  const hasContact = d.email || d.phone || d.address;

  return (
    <>
      <section
        className="pb-banner"
        style={{
          minHeight: 320,
          backgroundImage: isAllowedImage(d.bannerImage)
            ? `url(${JSON.stringify(d.bannerImage)})`
            : undefined,
        }}
      >
        <div className="pb-overlay" style={{ background: "rgba(0,0,0,.45)" }} />
        <div className="pb-banner-text">
          <h1>{page.title}</h1>
          {d.tagline && <p>{d.tagline}</p>}
        </div>
      </section>

      {stats.length > 0 && (
        <div className="tp-statband">
          <div className="tp-inner">
            <div className="tp-stats">
              {stats.map((s, i) => (
                <div className="tp-stat" key={i}>
                  <strong>{s.value}</strong>
                  <span>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {(hasAbout || hasHod) && (
        <Section title={hasAbout ? "About the department" : "Head of department"}>
          <div className={`tp-two${hasAbout && hasHod ? "" : " single"}`}>
            {hasAbout && (
              <div
                className="tp-rich"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(d.about) }}
              />
            )}
            {hasHod && (
              <div className="tp-hod">
                {isAllowedImage(d.hodPhoto) && <img src={d.hodPhoto} alt={d.hodName || ""} />}
                {d.hodName && <h3>{d.hodName}</h3>}
                {d.hodDesignation && <div className="role">{d.hodDesignation}</div>}
                {d.hodMessage && <p>{d.hodMessage}</p>}
              </div>
            )}
          </div>
        </Section>
      )}

      {programs.length > 0 && (
        <Section title="Programs" alt>
          <div className="tp-grid">
            {programs.map((p, i) => (
              <div className="tp-card" key={i}>
                {p.level && <span className="tp-tag">{p.level}</span>}
                <h3>{p.name}</h3>
                {p.duration && <div className="meta">Duration: {p.duration}</div>}
                {p.description && <p>{p.description}</p>}
              </div>
            ))}
          </div>
        </Section>
      )}

      {facilities.length > 0 && (
        <Section title="Facilities and labs">
          <div className="tp-grid">
            {facilities.map((f, i) => (
              <div className="tp-card pad0" key={i}>
                {isAllowedImage(f.image) && <img src={f.image} alt={f.title || ""} loading="lazy" />}
                <div className="tp-card-body">
                  <h3>{f.title}</h3>
                  {f.text && <p>{f.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {d.showFaculty !== false && faculty.length > 0 && (
        <Section title="Our faculty" alt>
          <div className="fc-grid">
            {faculty.map((p) => {
              const photo = p.data && p.data.photo;
              return (
                <Link className="fc-card" to={`/${p.slug}`} key={p.id}>
                  <div className="fc-photo">
                    {isAllowedImage(photo) ? (
                      <img src={photo} alt={p.title} loading="lazy" />
                    ) : (
                      (p.title || "?").charAt(0)
                    )}
                  </div>
                  <div className="fc-info">
                    <strong>{p.title}</strong>
                    {p.data && p.data.designation && <span>{p.data.designation}</span>}
                  </div>
                </Link>
              );
            })}
          </div>
        </Section>
      )}

      {hasContact && (
        <Section title="Contact">
          <div className="tp-contact">
            {d.email && (
              <div>
                <strong>Email</strong>
                <a href={`mailto:${d.email}`}>{d.email}</a>
              </div>
            )}
            {d.phone && (
              <div>
                <strong>Phone</strong>
                <a href={`tel:${d.phone.replace(/[^\d+]/g, "")}`}>{d.phone}</a>
              </div>
            )}
            {d.address && (
              <div>
                <strong>Address</strong>
                <span style={{ whiteSpace: "pre-line" }}>{d.address}</span>
              </div>
            )}
          </div>
        </Section>
      )}
    </>
  );
}