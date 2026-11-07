import { CategoryEditorForm } from "../../../../components/admin/category-editor-form";

export default function NewCategoryPage() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">کاتالوگ</p>
          <h1 className="admin-page__title">دسته جدید</h1>
        </div>
      </header>
      <CategoryEditorForm />
    </section>
  );
}
