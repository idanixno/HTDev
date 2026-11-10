import { notFound } from "next/navigation";
import { PathStepEditorForm } from "../../../../../../components/admin/path-step-editor-form";
import { fetchAdminPath } from "../../../../../../lib/admin";

type Params = Promise<{ pathId: string }>;

export default async function NewPathStepPage({ params }: { params: Params }) {
  const { pathId } = await params;
  const path = await fetchAdminPath(pathId);
  if (!path) notFound();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">{path.title}</p>
          <h1 className="admin-page__title">گام جدید</h1>
        </div>
      </header>
      <PathStepEditorForm pathId={path.id} />
    </section>
  );
}
