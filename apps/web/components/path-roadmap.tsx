import Link from "next/link";
import type { PublicPath, PublicPathStep } from "../lib/catalog";

export function PathRoadmapTable({ steps }: { steps: PublicPathStep[] }) {
  if (steps.length === 0) {
    return (
      <p className="disinab-roadmap__empty-steps">گامی برای این مسیر ثبت نشده است.</p>
    );
  }

  return (
    <div className="disinab-roadmap__table-wrap">
      <table className="disinab-roadmap__table">
        <thead>
          <tr>
            <th scope="col">شماره</th>
            <th scope="col">نام دوره</th>
          </tr>
        </thead>
        <tbody>
          {steps.map((step, index) => {
            const title = step.course?.title ?? step.title;
            const href = step.course?.href ?? step.href;
            return (
              <tr key={step.id}>
                <td>{(index + 1).toLocaleString("fa-IR")}</td>
                <td>
                  <Link href={href}>{title}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function PathRoadmapSection({
  path,
  heading = "h2",
}: {
  path: PublicPath;
  heading?: "h1" | "h2";
}) {
  const Heading = heading;
  const steps = path.steps ?? [];
  const lead = path.description ?? path.summary;

  return (
    <section className="disinab-roadmap__section" aria-labelledby={`path-${path.slug}`}>
      <Heading id={`path-${path.slug}`} className="disinab-roadmap__section-title">
        {path.title}
      </Heading>
      {lead ? <p className="disinab-roadmap__prose">{lead}</p> : null}
      {path.summary && path.description && path.summary !== path.description ? (
        <p className="disinab-roadmap__prose disinab-roadmap__prose--secondary">
          {path.summary}
        </p>
      ) : null}
      <PathRoadmapTable steps={steps} />
    </section>
  );
}
