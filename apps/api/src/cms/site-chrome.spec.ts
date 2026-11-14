import { describe, expect, it } from "vitest";
import {
  DEFAULT_SITE_CHROME,
  parseChromeGroups,
  parseChromeLinks,
} from "./site-chrome";

describe("site chrome retired-page links", () => {
  it("omits FAQ and terms links from stored header/footer configuration", () => {
    const links = parseChromeLinks(
      [
        { href: "/faq", label: "FAQ" },
        { href: "/terms?from=footer", label: "Terms" },
        { href: "https://example.com/faq/old", label: "Old FAQ" },
        { href: "/courses", label: "Courses" },
      ],
      DEFAULT_SITE_CHROME.headerLinks,
    );

    expect(links).toEqual([
      { href: "/courses", label: "Courses", match: "/courses" },
    ]);
  });

  it("falls back to the remaining default navigation when only retired links remain", () => {
    const groups = parseChromeGroups(
      [
        {
          label: "About",
          links: [
            { href: "/faq", label: "FAQ" },
            { href: "/terms", label: "Terms" },
          ],
        },
      ],
      DEFAULT_SITE_CHROME.footerGroups,
    );

    expect(groups).toEqual(DEFAULT_SITE_CHROME.footerGroups);
  });
});
