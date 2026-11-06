"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("zharfa-theme");
    const next: Theme = stored === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    window.localStorage.setItem("zharfa-theme", next);
  }

  return (
    <button type="button" className="theme-toggle" onClick={toggle}>
      {theme === "dark" ? "حالت روشن" : "حالت تیره"}
    </button>
  );
}
