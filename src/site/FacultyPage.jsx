import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import { isAllowedImage, isAllowedUrl } from "../linkUtil";

const isWeb = (u) => /^https?:\/\//i.test(u);

function ExtLink({ href, children }) {
  if (!isAllowedUrl(href)) return <span>{children}</span>;
  return (
    <a
      href={href}
      target={isWeb(href) ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}

export default function FacultyPage({ page, pages }) {
  const d = page.data || {};
  const dept = pages.find((p) => p.id === d.departmentId && p.template === "department");
  const tags = (d.expertise || "").split(",").map((s) => s.trim()).filter(Boolean);
  const quals = d.qualifications || [];
  const exp = d.experience || [];
  const pubs = d.publications || [];
  const links = d.links || [];
  const hasBio = d.bio && d.bio.replace(/<[^>]*>/g, "").trim();
  const hasContact = d.email || d.phone;
  const hasSide = hasContact || links.length > 0 || tags.length > 0;
  const hasMain = hasBio || quals.length > 0 || exp.length > 0 || pubs.length > 0;

  return (
    <>
      <section className="fp-head">
        <div className="tp-inner fp-head-in">
          {isAllowedImage(d.photo) && <img className="fp-photo" src={d.photo} alt={page.title} />}
          <div>
            <h1>{page.title}</h1>
            {d.designation && <p className="fp-desig">{d.designation}</p>}
            {dept &&
              (dept.status === "published" ? (
                <Link className="fp-dept" to={`/${dept.slug}`}>{dept.title}</Link>
              ) : (
                <span className="fp-dept">{dept.title}</span>
              ))}
          </div>
        </div>
      </section>

      {(hasSide || hasMain) && (
        <section className="tp-sec">
          <div className={`tp-inner fp-grid${hasSide && hasMain ? "" : " single"}`}>
            {hasSide && (
              <aside className="fp-side">
                {hasContact && (
                  <div className="fp-box">
                    <h3>Contact</h3>
                    {d.email && <p><a href={`mailto:${d.email}`}>{d.email}</a></p>}
                    {d.phone && <p><a href={`tel:${d.phone.replace(/[^\d+]/g, "")}`}>{d.phone}</a></p>}
                  </div>
                )}
                {links.length > 0 && (
                  <div className="fp-box">
                    <h3>Profiles</h3>
                    <ul>
                      {links.map((l, i) => (
                        <li key={i}><ExtLink href={l.url}>{l.label || l.url}</ExtLink></li>
                      ))}
                    </ul>
                  </div>
                )}
                {tags.length > 0 && (
                  <div className="fp-box">
                    <h3>Areas of expertise</h3>
                    <div>
                      {tags.map((tg, i) => (
                        <span className="tp-tag" key={i}>{tg}</span>
                      ))}
                    </div>
                  </div>
                )}
              </aside>
            )}

            {hasMain && (
              <div className="fp-main">
                {hasBio && (
                  <div className="fp-block">
                    <h2>About</h2>
                    <div
                      className="tp-rich"
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(d.bio) }}
                    />
                  </div>
                )}

                {quals.length > 0 && (
                  <div className="fp-block">
                    <h2>Qualifications</h2>
                    <div className="fp-scroll">
                      <table className="fp-table">
                        <thead>
                          <tr><th>Degree</th><th>Institute</th><th>Year</th></tr>
                        </thead>
                        <tbody>
                          {quals.map((q, i) => (
                            <tr key={i}>
                              <td>{q.degree}</td>
                              <td>{q.institute}</td>
                              <td>{q.year}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {exp.length > 0 && (
                  <div className="fp-block">
                    <h2>Experience</h2>
                    <ul className="fp-list">
                      {exp.map((e, i) => (
                        <li key={i}>
                          <strong>{e.role}</strong>
                          {e.org ? `, ${e.org}` : ""}
                          {e.period ? ` (${e.period})` : ""}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {pubs.length > 0 && (
                  <div className="fp-block">
                    <h2>Publications</h2>
                    <ol className="fp-pubs">
                      {pubs.map((p, i) => (
                        <li key={i}>
                          {p.text}
                          {p.link && isAllowedUrl(p.link) && (
                            <> <ExtLink href={p.link}>View</ExtLink></>
                          )}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}