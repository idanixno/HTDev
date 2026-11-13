import { Notice } from "@zharfa/ui";
import { TopicEditorForm } from "../../../../components/admin/topic-editor-form";
import {
  fetchAdminArticles,
  fetchAdminCourses,
  fetchAdminTopics,
} from "../../../../lib/admin";

export default async function AdminNewTopicPage() {
  const [topics, courses, articles] = await Promise.all([
    fetchAdminTopics({ page: 1 }),
    fetchAdminCourses(),
    fetchAdminArticles(),
  ]);

  if (!topics || !courses || !articles) {
    return (
      <Notice tone="error" title="خطا">
        بارگذاری فرم موضوع ممکن نشد.
      </Notice>
    );
  }

  return (
    <section className="admin-page" aria-labelledby="admin-topic-new-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 id="admin-topic-new-heading" className="admin-page__title">
            موضوع جدید
          </h1>
        </div>
      </header>
      <TopicEditorForm
        parentOptions={topics.items.map((t) => ({
          id: t.id,
          label: t.name,
          slug: t.slug,
        }))}
        courseOptions={courses.items.map((c) => ({
          id: c.id,
          label: c.title,
          slug: c.slug,
        }))}
        articleOptions={articles.map((a) => ({
          id: a.id,
          label: a.title,
          slug: a.slug,
        }))}
        relationOptions={topics.items.map((t) => ({
          id: t.id,
          label: t.name,
          slug: t.slug,
        }))}
      />
    </section>
  );
}
