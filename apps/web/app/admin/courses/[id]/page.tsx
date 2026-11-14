import Link from "next/link";
import { Notice } from "@zharfa/ui";
import { CourseEditorForm } from "../../../../components/admin/course-editor-form";
import { CourseNotesEditor } from "../../../../components/admin/course-notes-editor";
import { CurriculumEditor } from "../../../../components/admin/curriculum-editor";
import { fetchAdminCategories, fetchAdminCourse } from "../../../../lib/admin";
import { loadTopicOptionsForEditors } from "../../../../lib/admin-topic-options";

type Params = Promise<{ id: string }>;

export default async function EditCoursePage({ params }: { params: Params }) {
  const { id } = await params;
  const [course, categories, topicOptions] = await Promise.all([
    fetchAdminCourse(id),
    fetchAdminCategories(),
    loadTopicOptionsForEditors(),
  ]);

  if (!course) {
    return (
      <section className="admin-page admin-course-editor-page">
        <header className="admin-page__header">
          <div>
            <p className="admin-page__eyebrow">کاتالوگ</p>
            <h1 className="admin-page__title">دوره پیدا نشد</h1>
            <p className="admin-page__subtitle">
              اطلاعات این دوره در دسترس نیست یا دسترسی ندارید. لطفاً دوباره تلاش کنید یا به فهرست دوره‌ها بازگردید.
            </p>
          </div>
        </header>
        <Notice tone="warning" title="دسترسی یا داده ناموجود">
          برای ادامه، به <Link href="/admin/courses">فهرست دوره‌ها</Link> برگردید.
        </Notice>
      </section>
    );
  }

  return (
    <section className="admin-page admin-course-editor-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 className="admin-page__title">{course.title}</h1>
          <p className="admin-page__subtitle">
            مشخصات، قیمت و انتشار را ویرایش کنید. سرفصل و جلسه را اضافه، ویرایش یا حذف کنید و برای هر جلسه ویدیو بگذارید.
          </p>
        </div>
      </header>
      <CourseEditorForm
        courseId={course.id}
        categories={(categories ?? []).map((category) => ({
          id: category.id,
          title: category.title,
        }))}
        topicOptions={topicOptions}
        initial={{
          slug: course.slug,
          title: course.title,
          summary: course.summary ?? "",
          description: course.description ?? "",
          instructorName: course.instructorName ?? "",
          showInstructor: course.showInstructor,
          categoryId: course.categoryId ?? "",
          publicationStatus: course.publicationStatus,
          offerKind: course.offerKind,
          priceToman: String(course.priceToman),
          compareAtToman:
            course.compareAtToman == null ? "" : String(course.compareAtToman),
          levelLabel: course.levelLabel ?? "",
          durationHours:
            course.durationHours == null ? "" : String(course.durationHours),
          featured: course.featured,
          sortOrder: String(course.sortOrder),
          coverAsset: course.coverAsset ?? "",
          previewAsset: course.previewAsset ?? "",
          indexLabel: course.indexLabel ?? "",
          diagramKind: course.diagramKind,
          seoTitle: course.seoTitle ?? "",
          seoDescription: course.seoDescription ?? "",
          ogImage: course.ogImage ?? "",
          noIndex: course.noIndex ?? false,
          topicIds: course.topicIds ?? [],
        }}
      />
      <CurriculumEditor course={course} />
      <article
        className="admin-panel"
        style={{ marginTop: "var(--zharfa-space-24)" }}
      >
        <CourseNotesEditor
          courseId={course.id}
          title="نکات انحصاری قبل از خرید"
          hint="فقط روی همین دوره دیده می‌شود و بعد از نکات عمومی می‌آید."
        />
      </article>
    </section>
  );
}
