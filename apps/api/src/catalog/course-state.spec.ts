import {
  CourseOfferKind,
  CoursePublicationStatus,
} from "@zharfa/database";
import { describe, expect, it } from "vitest";
import {
  defaultStatusLabel,
  isFreeAccessOffer,
  isPubliclyListed,
  isPurchasableOffer,
  toCardAvailability,
} from "./course-state";

describe("course state machine", () => {
  it("lists only PUBLISHED courses publicly", () => {
    expect(isPubliclyListed(CoursePublicationStatus.PUBLISHED)).toBe(true);
    expect(isPubliclyListed(CoursePublicationStatus.DRAFT)).toBe(false);
    expect(isPubliclyListed(CoursePublicationStatus.UNPUBLISHED)).toBe(false);
    expect(isPubliclyListed(CoursePublicationStatus.ARCHIVED)).toBe(false);
  });

  it("maps publication + offer to CourseCard faces without ad-hoc booleans", () => {
    expect(
      toCardAvailability({
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        offerKind: CourseOfferKind.PAID,
      }),
    ).toBe("publishedPaid");
    expect(
      toCardAvailability({
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        offerKind: CourseOfferKind.FREE,
      }),
    ).toBe("publishedFree");
    expect(
      toCardAvailability({
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        offerKind: CourseOfferKind.PRE_SALE,
      }),
    ).toBe("preorder");
    expect(
      toCardAvailability({
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        offerKind: CourseOfferKind.COMING_SOON,
      }),
    ).toBe("comingSoon");
    expect(
      toCardAvailability({
        publicationStatus: CoursePublicationStatus.DRAFT,
        offerKind: CourseOfferKind.PAID,
      }),
    ).toBe("unavailable");
    expect(
      toCardAvailability({
        publicationStatus: CoursePublicationStatus.ARCHIVED,
        offerKind: CourseOfferKind.FREE,
      }),
    ).toBe("unavailable");
  });

  it("provides Persian status labels for lifecycle and offer", () => {
    expect(
      defaultStatusLabel({
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        offerKind: CourseOfferKind.PAID,
      }),
    ).toBe("منتشرشده");
    expect(
      defaultStatusLabel({
        publicationStatus: CoursePublicationStatus.PUBLISHED,
        offerKind: CourseOfferKind.PRE_SALE,
      }),
    ).toContain("پیش‌فروش");
    expect(
      defaultStatusLabel({
        publicationStatus: CoursePublicationStatus.DRAFT,
        offerKind: CourseOfferKind.PAID,
      }),
    ).toBe("پیش‌نویس");
  });

  it("classifies purchasable vs free offers", () => {
    expect(isPurchasableOffer(CourseOfferKind.PAID)).toBe(true);
    expect(isPurchasableOffer(CourseOfferKind.PRE_SALE)).toBe(true);
    expect(isPurchasableOffer(CourseOfferKind.FREE)).toBe(false);
    expect(isPurchasableOffer(CourseOfferKind.COMING_SOON)).toBe(false);
    expect(isFreeAccessOffer(CourseOfferKind.FREE)).toBe(true);
    expect(isFreeAccessOffer(CourseOfferKind.PAID)).toBe(false);
  });
});
