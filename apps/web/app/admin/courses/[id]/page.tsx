import { notFound } from "next/navigation";
import { CourseEditorForm } from "../../../../components/admin/course-editor-form";
import { CurriculumEditor } from "../../../../components/admin/curriculum-editor";
import { fetchAdminCategories, fetchAdminCourse } from "../../../../lib/admin";

type Params = Promise<{ id: string }>;

export default async function EditCoursePage({ params }: { params: Params }) {
  const { id } = await params;
  const [course, categories] = await Promise.all([
    fetchAdminCourse(id),
    fetchAdminCategories(),
  ]);
  if (!course) notFound();

  return (
    <section className="admin-page">
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
        initial={{
          slug: course.slug,
          title: course.title,
          summary: course.summary ?? "",
          description: course.description ?? "",
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
        }}
      />
      <CurriculumEditor course={course} />
    </section>
  );
}
