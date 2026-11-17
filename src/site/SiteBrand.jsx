import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { isAllowedImage } from "../linkUtil";

export default function SiteBrand({ header }) {
  const [failed, setFailed] = useState(false);

  // Try again whenever the logo URL changes
  useEffect(() => {
    setFailed(false);
  }, [header.logo]);

  const showLogo = isAllowedImage(header.logo) && !failed;

  return (
    <Link to="/" className="site-name" aria-label={header.siteName}>
      {showLogo ? (
        <img
          className="site-logo"
          src={header.logo}
          alt={header.siteName}
          width={250}
          height={60}
          onError={() => setFailed(true)}
        />
      ) : (
        header.siteName
      )}
    </Link>
  );
}