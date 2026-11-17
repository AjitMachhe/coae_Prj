import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import DOMPurify from "dompurify";
import { getPublishedPageBySlug, usePublishedPages } from "../usePages";
import PageBody from "./PageBody";

export default function PageView() {
  const { slug } = useParams();
  const { pages } = usePublishedPages();
  const [state, setState] = useState({ loading: true, page: null, error: "" });

  useEffect(() => {
    let cancelled = false;
    setState({ loading: true, page: null, error: "" });
    getPublishedPageBySlug(slug)
      .then((page) => { if (!cancelled) setState({ loading: false, page, error: "" }); })
      .catch((err) => {
        if (!cancelled) setState({ loading: false, page: null, error: err.code || err.message });
      });
    return () => { cancelled = true; };
  }, [slug]);

  const { loading, page, error } = state;

  // Builder and template pages
  const built =
    page && (Array.isArray(page.blocks) || (page.template && page.template !== "custom"));
  if (built) {
    return (
      <main>
        <PageBody page={page} pages={pages} />
      </main>
    );
  }

  // Older pages that still use the single text field, and status messages
  return (
    <main className="public-body">
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && !page && (
        <>
          <h1>Page not found</h1>
          <p>This page doesn't exist or isn't published.</p>
        </>
      )}
      {page && (
        <article className="page-content">
          <h1>{page.title}</h1>
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(page.content || "") }} />
        </article>
      )}
    </main>
  );
}