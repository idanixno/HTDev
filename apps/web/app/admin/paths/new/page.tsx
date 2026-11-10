import { PathEditorForm } from "../../../../components/admin/path-editor-form";

export default function NewPathPage() {
  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">نقشهٔ راه</p>
          <h1 className="admin-page__title">مسیر جدید</h1>
        </div>
      </header>
      <PathEditorForm />
    </section>
  );
}
