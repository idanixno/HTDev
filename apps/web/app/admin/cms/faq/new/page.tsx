import { FaqEditorForm } from "../../../../../components/admin/faq-editor-form";

export default function NewFaqPage() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">محتوا</p>
          <h1 className="admin-page__title">پرسش جدید</h1>
        </div>
      </header>
      <FaqEditorForm />
    </section>
  );
}
