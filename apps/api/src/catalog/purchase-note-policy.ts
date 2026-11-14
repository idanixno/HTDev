const RETIRED_PAGES = ["/faq", "/terms"];

function isRetiredPageHref(href: string): boolean {
  let pathname: string;
  if (href.startsWith("/")) {
    pathname = href.split(/[?#]/, 1)[0] ?? "";
  } else {
    try {
      pathname = new URL(href).pathname;
    } catch {
      return false;
    }
  }
  return RETIRED_PAGES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`),
  );
}

export function hasRetiredPageLink(body: string): boolean {
  const links = body.matchAll(/\[[^\]]+\]\(([^)]+)\)/g);
  for (const link of links) {
    if (isRetiredPageHref(link[1]!.trim())) return true;
  }
  return false;
}
