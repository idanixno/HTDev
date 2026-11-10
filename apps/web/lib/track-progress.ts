import type { PublicCourseTrack, PublicPathStep } from "./catalog";

export type TrackStepStatus = "done" | "here" | "todo";

export type TrackStepView = {
  step: PublicPathStep;
  index: number;
  status: TrackStepStatus;
  owned: boolean;
  href: string;
  title: string;
  focus: string | null;
};

export type TrackProgress = {
  total: number;
  done: number;
  remaining: number;
  ratio: number;
  complete: boolean;
  steps: TrackStepView[];
  /** First incomplete course step — the clear next action. */
  next: TrackStepView | null;
  /** Last completed course step — latest progress point. */
  latest: TrackStepView | null;
  doneSteps: TrackStepView[];
  remainingSteps: TrackStepView[];
};

function stepTitle(step: PublicPathStep) {
  return step.course?.title ?? step.title;
}

function stepFocus(step: PublicPathStep) {
  const text = (step.summary || step.course?.summary || "").trim();
  return text || null;
}

/**
 * Derive journey progress from ownership only — no invented skills.
 * `anchorSlug` (course page) marks «همین‌جا»; otherwise next incomplete is «here».
 */
export function buildTrackProgress(
  track: PublicCourseTrack,
  owned: Set<string>,
  anchorSlug?: string | null,
): TrackProgress {
  const courseSteps = track.steps
    .map((step, index) => ({ step, index }))
    .filter(({ step }) => Boolean(step.course));

  const nextIncompleteIndex = courseSteps.find(
    ({ step }) => step.course && !owned.has(step.course.slug),
  )?.index;

  const views: TrackStepView[] = track.steps.map((step, index) => {
    const ownedStep = Boolean(step.course && owned.has(step.course.slug));
    let status: TrackStepStatus = "todo";
    if (ownedStep) {
      status = "done";
    } else if (anchorSlug && step.course?.slug === anchorSlug) {
      status = "here";
    } else if (
      !anchorSlug &&
      nextIncompleteIndex != null &&
      index === nextIncompleteIndex
    ) {
      status = "here";
    } else if (
      anchorSlug &&
      nextIncompleteIndex != null &&
      index === nextIncompleteIndex &&
      step.course?.slug !== anchorSlug
    ) {
      status = "todo";
    }

    return {
      step,
      index,
      status,
      owned: ownedStep,
      href: step.course?.href ?? step.href,
      title: stepTitle(step),
      focus: stepFocus(step),
    };
  });

  const withCourse = views.filter((v) => v.step.course);
  const doneSteps = withCourse.filter((v) => v.owned);
  const remainingSteps = withCourse.filter((v) => !v.owned);
  const total = withCourse.length;
  const done = doneSteps.length;
  const complete = total > 0 && done >= total;
  const next =
    remainingSteps.find((v) => v.status === "here") ??
    remainingSteps[0] ??
    null;
  const latest = doneSteps.length ? doneSteps[doneSteps.length - 1]! : null;

  return {
    total,
    done,
    remaining: remainingSteps.length,
    ratio: total > 0 ? done / total : 0,
    complete,
    steps: views,
    next,
    latest,
    doneSteps,
    remainingSteps,
  };
}

export function trackDisplayTitle(track: PublicCourseTrack) {
  return track.title;
}
