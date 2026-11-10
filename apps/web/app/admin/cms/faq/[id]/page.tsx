import { notFound } from "next/navigation";
import { FaqEditorForm } from "../../../../../components/admin/faq-editor-form";
import { fetchAdminFaq } from "../../../../../lib/admin";

type Params = Promise<{ id: string }>;

export default async function EditFaqPage({ params }: { params: Params }) {
  const { id } = await params;
  const faqs = await fetchAdminFaq();
  const faq = faqs?.find((item) => item.id === id);
  if (!faq) notFound();

  return (
    <section className="admin-page">
      <header className="admin-page__header">
        <div>
          <p className="admin-page__eyebrow">محتوا</p>
          <h1 className="admin-page__title">ویرایش پرسش</h1>
        </div>
      </header>
      <FaqEditorForm
        faqId={faq.id}
        initial={{
          question: faq.question,
          answer: faq.answer,
          sortOrder: String(faq.sortOrder),
          published: faq.published,
        }}
      />
    </section>
  );
}
