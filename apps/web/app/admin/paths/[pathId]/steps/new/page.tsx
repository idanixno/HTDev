import { notFound } from "next/navigation";
import { Notice } from "@zharfa/ui";
import { PathStepEditorForm } from "../../../../../../components/admin/path-step-editor-form";
import {
  fetchAdminCourseOptions,
  fetchAdminPath,
} from "../../../../../../lib/admin";

type Params = Promise<{ pathId: string }>;

export default async function NewPathStepPage({ params }: { params: Params }) {
  const { pathId } = await params;
  const [path, courseOptions] = await Promise.all([
    fetchAdminPath(pathId),
    fetchAdminCourseOptions(),
  ]);
  if (!path) notFound();
  if (!courseOptions) {
    return (
      <section className="admin-page">
        <Notice tone="error" title="خطا">
          فهرست دوره‌ها بارگذاری نشد؛ امکان انتخاب دوره برای این گام وجود ندارد.
        </Notice>
      </section>
    );
  }

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">{path.title}</p>
          <h1 className="admin-page__title">گام جدید</h1>
        </div>
      </header>
      <PathStepEditorForm pathId={path.id} courseOptions={courseOptions} />
    </section>
  );
}
