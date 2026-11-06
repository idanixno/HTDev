import {
  CourseOfferKind,
  CoursePublicationStatus,
} from "@zharfa/database";

/** UI / CourseCard availability faces (mirrors @zharfa/ui CourseAvailability). */
export type CourseCardAvailability =
  | "publishedPaid"
  | "publishedFree"
  | "preorder"
  | "inProduction"
  | "comingSoon"
  | "unavailable";

export type CourseStateInput = {
  publicationStatus: CoursePublicationStatus;
  offerKind: CourseOfferKind;
};

/**
 * Public catalog only surfaces PUBLISHED courses.
 * DRAFT / UNPUBLISHED / ARCHIVED stay out of list/detail endpoints.
 */
export function isPubliclyListed(
  publicationStatus: CoursePublicationStatus,
): boolean {
  return publicationStatus === CoursePublicationStatus.PUBLISHED;
}

/**
 * Map orthogonal publication + offer enums onto a single CourseCard face.
 * Coherent state machine — no ad-hoc booleans like `isFree && isPublished`.
 */
export function toCardAvailability(
  input: CourseStateInput,
): CourseCardAvailability {
  if (!isPubliclyListed(input.publicationStatus)) {
    return "unavailable";
  }

  switch (input.offerKind) {
    case CourseOfferKind.FREE:
      return "publishedFree";
    case CourseOfferKind.PAID:
      return "publishedPaid";
    case CourseOfferKind.PRE_SALE:
      return "preorder";
    case CourseOfferKind.COMING_SOON:
      return "comingSoon";
    default: {
      const _exhaustive: never = input.offerKind;
      return _exhaustive;
    }
  }
}

export function defaultStatusLabel(input: CourseStateInput): string {
  if (!isPubliclyListed(input.publicationStatus)) {
    switch (input.publicationStatus) {
      case CoursePublicationStatus.DRAFT:
        return "پیش‌نویس";
      case CoursePublicationStatus.UNPUBLISHED:
        return "لغو انتشار";
      case CoursePublicationStatus.ARCHIVED:
        return "بایگانی";
      default:
        return "ناموجود";
    }
  }

  switch (input.offerKind) {
    case CourseOfferKind.FREE:
    case CourseOfferKind.PAID:
      return "منتشرشده";
    case CourseOfferKind.PRE_SALE:
      return "پیش‌فروش · تاریخ در انتظار تأیید";
    case CourseOfferKind.COMING_SOON:
      return "به‌زودی";
    default: {
      const _exhaustive: never = input.offerKind;
      return _exhaustive;
    }
  }
}

/** Whether checkout / enroll flows may eventually apply (payments wired later). */
export function isPurchasableOffer(offerKind: CourseOfferKind): boolean {
  return (
    offerKind === CourseOfferKind.PAID || offerKind === CourseOfferKind.PRE_SALE
  );
}

export function isFreeAccessOffer(offerKind: CourseOfferKind): boolean {
  return offerKind === CourseOfferKind.FREE;
}
