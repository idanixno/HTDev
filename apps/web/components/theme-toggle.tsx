"use client";

import { useEffect, useState, type MouseEvent } from "react";

type Theme = "dark" | "light";

function SunIcon() {
  return (
    <svg
      className="theme-toggle__sun"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3.6" />
      <path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.05 5.05l1.55 1.55M17.4 17.4l1.55 1.55M5.05 18.95l1.55-1.55M17.4 6.6l1.55-1.55" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      className="theme-toggle__moon"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19.2 13.6A7.4 7.4 0 0 1 10.4 4.8 7.5 7.5 0 1 0 19.2 13.6Z" />
    </svg>
  );
}

function applyTheme(next: Theme) {
  document.documentElement.setAttribute("data-theme", next);
  window.localStorage.setItem("zharfa-theme", next);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("zharfa-theme");
    const next: Theme = stored === "light" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
  }, []);

  function toggle(event: MouseEvent<HTMLButtonElement>) {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    const commit = () => {
      setTheme(next);
      applyTheme(next);
    };

    if (prefersReducedMotion()) {
      commit();
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const radius = Math.hypot(
      Math.max(x, window.innerWidth - x),
      Math.max(y, window.innerHeight - y),
    );
    root.style.setProperty("--theme-toggle-x", `${x}px`);
    root.style.setProperty("--theme-toggle-y", `${y}px`);
    root.style.setProperty("--theme-toggle-r", `${radius}px`);
    root.dataset.themeTo = next;

    const startViewTransition = document.startViewTransition?.bind(document);
    if (startViewTransition) {
      const transition = startViewTransition(commit);
      void transition.finished.finally(() => {
        delete root.dataset.themeTo;
      });
      return;
    }

    root.classList.add("is-theme-switching");
    commit();
    window.setTimeout(() => {
      root.classList.remove("is-theme-switching");
      delete root.dataset.themeTo;
    }, 480);
  }

  return (
    <button
      type="button"
      className={
        "theme-toggle" +
        (theme === "light" ? " theme-toggle--light" : " theme-toggle--dark")
      }
      onClick={toggle}
      aria-pressed={theme === "light"}
      aria-label={
        theme === "dark" ? "فعال‌سازی حالت روشن" : "فعال‌سازی حالت تیره"
      }
    >
      <span className="theme-toggle__stage" aria-hidden="true">
        <SunIcon />
        <MoonIcon />
      </span>
    </button>
  );
}
