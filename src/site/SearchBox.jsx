import { useState } from "react";
import { Link } from "react-router-dom";

export default function SearchBox({ pages }) {
  const [q, setQ] = useState("");
  const term = q.trim().toLowerCase();
  const results = term
    ? pages.filter((p) => p.title.toLowerCase().includes(term)).slice(0, 6)
    : [];

  return (
    <div className="search">
      <input
        placeholder="Search pages..."
        value={q}
        onChange={(e) => setQ(e.target.value)}
        onKeyDown={(e) => e.key === "Escape" && setQ("")}
      />
      {term && (
        <div className="search-results">
          {results.map((p) => (
            <Link key={p.id} to={`/${p.slug}`} onClick={() => setQ("")}>
              {p.title}
            </Link>
          ))}
          {!results.length && <div className="none">No pages found</div>}
        </div>
      )}
    </div>
  );
}