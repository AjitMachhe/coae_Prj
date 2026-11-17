import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import { useHeader } from "../useHeader";

export default function SiteLayout() {
  const { header } = useHeader();
  const accent = header ? header.mainBg : null;

  useEffect(() => {
    if (!accent) return;
    document.documentElement.style.setProperty("--btn", accent);
    return () => document.documentElement.style.removeProperty("--btn");
  }, [accent]);

  return (
    <div>
      <Header />
      <Outlet />
    </div>
  );
}