import { notFound } from "next/navigation";
import { ArticleEditorForm } from "../../../../components/admin/article-editor-form";
import { fetchAdminArticle } from "../../../../lib/admin";

type Params = Promise<{ id: string }>;

export default async function EditArticlePage({ params }: { params: Params }) {
  const { id } = await params;
  const article = await fetchAdminArticle(id);
  if (!article) notFound();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">انتشار</p>
          <h1 className="admin-page__title">{article.title}</h1>
        </div>
      </header>
      <ArticleEditorForm
        articleId={article.id}
        initial={{
          slug: article.slug,
          title: article.title,
          summary: article.summary ?? "",
          body: article.body,
          coverAsset: article.coverAsset ?? "",
          seoTitle: article.seoTitle ?? "",
          seoDescription: article.seoDescription ?? "",
          ogImage: article.ogImage ?? "",
          noIndex: article.noIndex,
          published: article.published,
          readingMinutes:
            article.readingMinutes == null ? "" : String(article.readingMinutes),
          sortOrder: String(article.sortOrder),
        }}
      />
    </section>
  );
}
