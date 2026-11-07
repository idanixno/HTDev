import { CourseEditorForm } from "../../../../components/admin/course-editor-form";
import { fetchAdminCategories } from "../../../../lib/admin";

export default async function NewCoursePage() {
  const categories = (await fetchAdminCategories()) ?? [];
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 className="admin-page__title">دوره جدید</h1>
          <p className="admin-page__subtitle">
            پیش‌نویس بسازید. سرفصل بعد از ایجاد دوره اضافه می‌شود.
          </p>
        </div>
      </header>
      <CourseEditorForm
        categories={categories.map((category) => ({
          id: category.id,
          title: category.title,
        }))}
      />
    </section>
  );
}
