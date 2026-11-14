UPDATE "CoursePurchaseNote"
SET "body" = 'پیش از خرید، سرفصل‌ها و شرایط دسترسی دوره را بررسی کنید.'
WHERE "id" = 'seed_purchase_note_faq'
  AND "body" LIKE '%/faq%';
