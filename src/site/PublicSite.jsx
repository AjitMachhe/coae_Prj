import { useMenuItems } from "../useMenuItems";
import { styleToCss } from "../menuStyle";

export default function PublicSite() {
  const { items, loading, error } = useMenuItems();

  return (
    <div>
      <nav className="public-nav">
        {loading && <span>Loading...</span>}
        {error && <span className="error">{error}</span>}
        {items.map((item) => (
          <span key={item.id} className="public-link" style={styleToCss(item.style)}>
            {item.label}
          </span>
        ))}
      </nav>
      <main className="public-body">
        <h1>Welcome</h1>
        <p>Pages will appear here once we connect them in Step 5.</p>
      </main>
    </div>
  );
}