import { Link } from "react-router-dom";
import { resolveLink } from "../linkUtil";

export default function SmartLink({ link, pages, className, style, onClick, children }) {
  const r = resolveLink(link, pages);

  if (!r) {
    return <span className={className} style={style}>{children}</span>;
  }
  if (r.internal) {
    return (
      <Link to={r.href} className={className} style={style} onClick={onClick}>
        {children}
      </Link>
    );
  }
  return (
    <a
      href={r.href}
      className={className}
      style={style}
      onClick={onClick}
      target={r.newTab ? "_blank" : undefined}
      rel="noopener noreferrer"
    >
      {children}
    </a>
  );
}