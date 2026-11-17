import { Link } from "react-router-dom";
import { useMenuItems } from "../useMenuItems";
import { usePublishedPages } from "../usePages";
import { useHeader } from "../useHeader";
import { menuOf } from "../menuStyle";
import MenuLink from "./MenuLink";
import MegaItem from "./MegaItem";
import SearchBox from "./SearchBox";
import SiteBrand from "./SiteBrand";

export default function Header() {
  const { items, error } = useMenuItems();
  const { pages, error: pagesError } = usePublishedPages();
  const { header, error: headerError } = useHeader();

  if (!header) return null; // wait for settings so the header doesn't flash

  const top = items.filter((i) => menuOf(i) === "top");
  const main = items.filter((i) => menuOf(i) === "main");

  return (
    <header className="site-header">
      {header.showTopBar && (
        <div className="top-bar" style={{ background: header.topBg }}>
          {header.topLabel && <span className="top-label">{header.topLabel}</span>}
          <div className="top-links">
            {top.map((item) => (
              <MenuLink key={item.id} item={item} pages={pages} />
            ))}
          </div>
          <span className="top-spacer" />
          {header.showSearch && <SearchBox pages={pages} />}
        </div>
      )}

      <div className="main-bar" style={{ background: header.mainBg }}>
           <SiteBrand header={header} />
        <nav className="main-links">
          {main.map((item) =>
            item.mega ? (
              <MegaItem key={item.id} item={item} pages={pages} />
            ) : (
              <MenuLink key={item.id} item={item} pages={pages} />
            )
          )}
        </nav>
        {!header.showTopBar && header.showSearch && <SearchBox pages={pages} />}
      </div>

      {(error || pagesError || headerError) && (
        <div className="error" style={{ padding: "6px 24px", background: "#fff" }}>
          {error && `menu: ${error} `}
          {pagesError && `pages: ${pagesError} `}
          {headerError && `header: ${headerError}`}
        </div>
      )}
    </header>
  );
}