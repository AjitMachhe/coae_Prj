import { Link } from "react-router-dom";
import { publicLinkStyle } from "../menuStyle";
import { isAllowedUrl } from "../linkUtil";

export default function MenuLink({ item, pages }) {
  const style = publicLinkStyle(item.style);
  const link = item.link || { type: "none" };

  if (link.type === "page") {
    const page = pages.find((p) => p.id === link.pageId);
    if (page) {
      return (
        <Link className="public-link hv" style={style} to={`/${page.slug}`}>
          {item.label}
        </Link>
      );
    }
  }

  if (link.type === "url" && isAllowedUrl(link.url || "")) {
    if (link.url.startsWith("/")) {
      return (
        <Link className="public-link hv" style={style} to={link.url}>
          {item.label}
        </Link>
      );
    }
    return (
      <a
        className="public-link hv"
        style={style}
        href={link.url}
        target={link.newTab ? "_blank" : undefined}
        rel="noopener noreferrer"
      >
        {item.label}
      </a>
    );
  }

  // No link, or the linked page is unpublished or deleted
  return <span className="public-link hv" style={style}>{item.label}</span>;
}