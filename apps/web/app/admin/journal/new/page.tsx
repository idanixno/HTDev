import { ArticleEditorForm } from "../../../../components/admin/article-editor-form";
import { loadTopicOptionsForEditors } from "../../../../lib/admin-topic-options";

export default async function NewArticlePage() {
  const topicOptions = await loadTopicOptionsForEditors();
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">انتشار</p>
          <h1 className="admin-page__title">مقاله جدید</h1>
        </div>
      </header>
      <ArticleEditorForm topicOptions={topicOptions} />
    </section>
  );
}
