import { notFound } from "next/navigation";
import { Notice } from "@zharfa/ui";
import { TopicEditorForm } from "../../../../components/admin/topic-editor-form";
import {
  fetchAdminArticles,
  fetchAdminCourses,
  fetchAdminTopic,
  fetchAdminTopics,
} from "../../../../lib/admin";

type Params = Promise<{ id: string }>;

export default async function AdminTopicEditPage({
  params,
}: {
  params: Params;
}) {
  const { id } = await params;
  const [topic, topics, courses, articles] = await Promise.all([
    fetchAdminTopic(id),
    fetchAdminTopics({ page: 1 }),
    fetchAdminCourses(),
    fetchAdminArticles(),
  ]);

  if (!topic) notFound();
  if (!topics || !courses || !articles) {
    return (
      <Notice tone="error" title="خطا">
        بارگذاری فرم موضوع ممکن نشد.
      </Notice>
    );
  }

  return (
    <section className="admin-page" aria-labelledby="admin-topic-edit-heading">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 id="admin-topic-edit-heading" className="admin-page__title">
            ویرایش موضوع
          </h1>
          <p className="admin-page__subtitle" dir="ltr">
            {topic.href}
          </p>
        </div>
      </header>
      <TopicEditorForm
        topicId={topic.id}
        initial={{
          name: topic.name,
          slug: topic.slug,
          description: topic.description ?? "",
          introContent: topic.introContent ?? "",
          seoTitle: topic.seoTitle ?? "",
          seoDescription: topic.seoDescription ?? "",
          h1: topic.h1 ?? "",
          parentTopicId: topic.parentTopicId ?? "",
          canonicalUrl: topic.canonicalUrl ?? "",
          indexable: topic.indexable,
          status: topic.status,
          sortOrder: String(topic.sortOrder),
          courseIds: topic.courseIds,
          articleIds: topic.articleIds,
        }}
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
        existingRelations={topic.relations}
      />
    </section>
  );
}
