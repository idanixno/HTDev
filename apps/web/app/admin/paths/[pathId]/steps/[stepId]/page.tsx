import Link from "next/link";
import { notFound } from "next/navigation";
import { Notice } from "@zharfa/ui";
import { PathStepEditorForm } from "../../../../../../components/admin/path-step-editor-form";
import {
  fetchAdminCourseOptions,
  fetchAdminPathStep,
} from "../../../../../../lib/admin";

type Params = Promise<{ pathId: string; stepId: string }>;

export default async function EditPathStepPage({ params }: { params: Params }) {
  const { pathId, stepId } = await params;
  const [step, courseOptions] = await Promise.all([
    fetchAdminPathStep(pathId, stepId),
    fetchAdminCourseOptions(),
  ]);
  if (!step) notFound();
  if (!courseOptions) {
    return (
      <section className="admin-page">
        <Notice tone="error" title="خطا">
          فهرست دوره‌ها بارگذاری نشد؛ امکان انتخاب دوره برای این گام وجود ندارد.
        </Notice>
      </section>
    );
  }

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
        courseOptions={courseOptions}
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
          courseId: step.courseId ?? "",
        }}
      />
    </section>
  );
}
