"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function useMenuDrawer(query: string) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [narrow, setNarrow] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const apply = () => {
      setNarrow(media.matches);
      if (!media.matches) setOpen(false);
    };
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [query]);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return {
    open,
    narrow,
    close: () => setOpen(false),
    toggle: () => setOpen((value) => !value),
  };
}
