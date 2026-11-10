import Link from "next/link";
import { notFound } from "next/navigation";
import { PathStepEditorForm } from "../../../../../../components/admin/path-step-editor-form";
import { fetchAdminPathStep } from "../../../../../../lib/admin";

type Params = Promise<{ pathId: string; stepId: string }>;

export default async function EditPathStepPage({ params }: { params: Params }) {
  const { pathId, stepId } = await params;
  const step = await fetchAdminPathStep(pathId, stepId);
  if (!step) notFound();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">
            <Link href={`/admin/paths/${pathId}`}>{step.path.title}</Link>
          </p>
          <h1 className="admin-page__title">{step.title}</h1>
          <p className="admin-page__subtitle">
            {step.course
              ? `دورهٔ وصل‌شده به این گام: ${step.course.title}. کارت دوره با !course[${step.course.slug}]، ویدیو با !video[]()، پرسش‌وپاسخ با !faq[…] … !/faq.`
              : "دوره‌ای به این گام وصل نیست. از !course[slug]، !video[]()، جدول، کد و !faq[…] … !/faq استفاده کنید."}
          </p>
        </div>
      </header>
      <PathStepEditorForm
        pathId={pathId}
        stepId={stepId}
        initial={{
          slug: step.slug,
          title: step.title,
          summary: step.summary ?? "",
          body: step.body,
          seoTitle: step.seoTitle ?? "",
          seoDescription: step.seoDescription ?? "",
          ogImage: step.ogImage ?? "",
          noIndex: step.noIndex,
          sortOrder: String(step.sortOrder ?? 0),
        }}
      />
    </section>
  );
}
