import { CourseEditorForm } from "../../../../components/admin/course-editor-form";
import { fetchAdminCategories } from "../../../../lib/admin";
import { loadTopicOptionsForEditors } from "../../../../lib/admin-topic-options";

export default async function NewCoursePage() {
  const [categories, topicOptions] = await Promise.all([
    fetchAdminCategories(),
    loadTopicOptionsForEditors(),
  ]);
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
        categories={(categories ?? []).map((category) => ({
          id: category.id,
          title: category.title,
        }))}
        topicOptions={topicOptions}
      />
    </section>
  );
}
