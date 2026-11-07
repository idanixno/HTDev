import { ArticleEditorForm } from "../../../../components/admin/article-editor-form";

export default function NewArticlePage() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">انتشار</p>
          <h1 className="admin-page__title">یادداشت جدید</h1>
        </div>
      </header>
      <ArticleEditorForm />
    </section>
  );
}
