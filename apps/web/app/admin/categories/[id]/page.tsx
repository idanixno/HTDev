import { notFound } from "next/navigation";
import { CategoryEditorForm } from "../../../../components/admin/category-editor-form";
import { fetchAdminCategories } from "../../../../lib/admin";

type Params = Promise<{ id: string }>;

export default async function EditCategoryPage({ params }: { params: Params }) {
  const { id } = await params;
  const categories = await fetchAdminCategories();
  const category = categories?.find((item) => item.id === id);
  if (!category) notFound();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 className="admin-page__title">{category.title}</h1>
        </div>
      </header>
      <CategoryEditorForm
        categoryId={category.id}
        initial={{
          slug: category.slug,
          title: category.title,
          summary: category.summary ?? "",
          sortOrder: String(category.sortOrder),
        }}
      />
    </section>
  );
}
