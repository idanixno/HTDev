import {
  fetchPath,
  fetchPaths,
  type PublicCourseTrack,
} from "./catalog";
import { buildTrackProgress } from "./track-progress";

/**
 * Learning paths that intersect the user's owned courses.
 * Untouched paths stay hidden until at least one step is owned.
 */
export async function fetchMyRelevantTracks(
  owned: Set<string>,
): Promise<PublicCourseTrack[]> {
  if (owned.size === 0) return [];

  const pathSummaries = await fetchPaths();
  const details = await Promise.all(
    pathSummaries.map((path) => fetchPath(path.slug)),
  );

  return details
    .filter((path): path is NonNullable<typeof path> =>
      Boolean(path?.steps?.length),
    )
    .map((path) => {
      const steps = path.steps ?? [];
      const nextIncomplete = steps.findIndex(
        (step) => step.course && !owned.has(step.course.slug),
      );
      const firstOwned = steps.findIndex(
        (step) => step.course && owned.has(step.course.slug),
      );
      const currentStepIndex =
        nextIncomplete >= 0
          ? nextIncomplete
          : firstOwned >= 0
            ? firstOwned
            : null;
      const currentCourseSlug =
        currentStepIndex != null
          ? (steps[currentStepIndex]?.course?.slug ?? "")
          : "";

      return {
        ...path,
        steps,
        credentialLabel: `تخصص ژرفا · ${path.title}`,
        currentCourseSlug,
        currentStepIndex,
      } satisfies PublicCourseTrack;
    })
    .filter((track) => buildTrackProgress(track, owned).done > 0)
    .sort((a, b) => {
      const pa = buildTrackProgress(a, owned);
      const pb = buildTrackProgress(b, owned);
      const rank = (p: typeof pa) => {
        if (p.done > 0 && !p.complete) return 0;
        if (p.complete) return 1;
        return 2;
      };
      return rank(pa) - rank(pb);
    });
}
