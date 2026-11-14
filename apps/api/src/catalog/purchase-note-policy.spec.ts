import { describe, expect, it } from "vitest";
import { hasRetiredPageLink } from "./purchase-note-policy";

describe("purchase note retired-page policy", () => {
  it("detects links to removed FAQ and terms pages", () => {
    expect(hasRetiredPageLink("See [FAQ](/faq).")).toBe(true);
    expect(hasRetiredPageLink("[Terms](https://dxcode.example/terms?from=note)")).toBe(
      true,
    );
    expect(hasRetiredPageLink("[Old FAQ](/faq/archive)")).toBe(true);
  });

  it("keeps notes with no links to removed pages", () => {
    expect(hasRetiredPageLink("Review the syllabus before purchasing.")).toBe(
      false,
    );
    expect(hasRetiredPageLink("[Courses](/courses)")).toBe(false);
    expect(hasRetiredPageLink("[External FAQ](https://example.com/help)")).toBe(
      false,
    );
  });
});
