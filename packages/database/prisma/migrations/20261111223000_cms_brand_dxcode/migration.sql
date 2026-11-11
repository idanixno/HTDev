-- Canonical production brand: DXCode (replaces legacy ژرفا defaults).
-- Safe: only changes column default + upserts singleton chrome when missing/legacy.

ALTER TABLE "CmsFooterContent"
  ALTER COLUMN "brandName" SET DEFAULT 'DXCode';

INSERT INTO "CmsFooterContent" (
  "id",
  "brandName",
  "brandTagline",
  "brandKicker",
  "footerBlurb",
  "headerLinks",
  "footerGroups",
  "mobileGroups",
  "guestCtaLabel",
  "guestCtaHref",
  "authedCtaLabel",
  "authedCtaHref",
  "showCart",
  "showThemeToggle",
  "trustsLabel",
  "mobileMenuTitle",
  "mobileMenuLine",
  "enamadHtml",
  "paymentGatewayHtml",
  "updatedAt",
  "createdAt"
) VALUES (
  'footer',
  'DXCode',
  'LEARN · BUILD · GROW',
  'استودیو',
  'DXCode جایی است برای یادگیری عمیق فناوری؛ از اولین مسئله تا تصمیم‌های مهندسی. دوره، مسیر روشن و تمرین واقعی — تا مهارت قابل‌اتکا بسازی، نه فقط تئوری حفظ‌کردنی.',
  '[{"href":"/courses","label":"دوره‌ها","match":"/courses"},{"href":"/paths","label":"مسیرها","match":"/paths"},{"href":"/journal","label":"مقالات","match":"/journal"}]'::jsonb,
  '[{"label":"یادگیری","links":[{"href":"/courses","label":"دوره‌ها"},{"href":"/paths","label":"مسیرهای یادگیری"},{"href":"/journal","label":"مقالات"}]},{"label":"درباره","links":[{"href":"/faq","label":"پرسش‌های رایج"},{"href":"/terms","label":"شرایط استفاده"}]}]'::jsonb,
  '[{"label":"یادگیری","links":[{"href":"/courses","label":"دوره‌ها"},{"href":"/paths","label":"مسیرهای یادگیری"},{"href":"/journal","label":"مقالات"}]},{"label":"درباره","links":[{"href":"/faq","label":"پرسش‌ها"},{"href":"/terms","label":"شرایط استفاده"}]}]'::jsonb,
  'ورود',
  '/login',
  'حساب من',
  '/dashboard',
  true,
  true,
  'اعتماد و پرداخت',
  'منو',
  'دوره‌ها، مسیرها و حساب — یک صفحه.',
  NULL,
  NULL,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO UPDATE SET
  "brandName" = CASE
    WHEN "CmsFooterContent"."brandName" IS NULL
      OR btrim("CmsFooterContent"."brandName") = ''
      OR "CmsFooterContent"."brandName" = 'ژرفا'
    THEN EXCLUDED."brandName"
    ELSE "CmsFooterContent"."brandName"
  END,
  "brandTagline" = CASE
    WHEN "CmsFooterContent"."brandTagline" IS NULL
      OR btrim("CmsFooterContent"."brandTagline") = ''
      OR "CmsFooterContent"."brandTagline" LIKE '%اطلس یادگیری%'
    THEN EXCLUDED."brandTagline"
    ELSE "CmsFooterContent"."brandTagline"
  END,
  "brandKicker" = COALESCE(NULLIF(btrim("CmsFooterContent"."brandKicker"), ''), EXCLUDED."brandKicker"),
  "footerBlurb" = CASE
    WHEN "CmsFooterContent"."footerBlurb" IS NULL
      OR btrim("CmsFooterContent"."footerBlurb") = ''
      OR "CmsFooterContent"."footerBlurb" LIKE '%ژرفا اطلس%'
    THEN EXCLUDED."footerBlurb"
    ELSE "CmsFooterContent"."footerBlurb"
  END,
  "headerLinks" = COALESCE("CmsFooterContent"."headerLinks", EXCLUDED."headerLinks"),
  "footerGroups" = CASE
    WHEN "CmsFooterContent"."footerGroups" IS NULL
      OR "CmsFooterContent"."footerGroups"::text LIKE '%"label": "ژرفا"%'
      OR "CmsFooterContent"."footerGroups"::text LIKE '%"label":"ژرفا"%'
    THEN EXCLUDED."footerGroups"
    ELSE "CmsFooterContent"."footerGroups"
  END,
  "mobileGroups" = CASE
    WHEN "CmsFooterContent"."mobileGroups" IS NULL
      OR "CmsFooterContent"."mobileGroups"::text LIKE '%"label": "ژرفا"%'
      OR "CmsFooterContent"."mobileGroups"::text LIKE '%"label":"ژرفا"%'
    THEN EXCLUDED."mobileGroups"
    ELSE "CmsFooterContent"."mobileGroups"
  END,
  "guestCtaLabel" = COALESCE(NULLIF(btrim("CmsFooterContent"."guestCtaLabel"), ''), EXCLUDED."guestCtaLabel"),
  "guestCtaHref" = COALESCE(NULLIF(btrim("CmsFooterContent"."guestCtaHref"), ''), EXCLUDED."guestCtaHref"),
  "authedCtaLabel" = COALESCE(NULLIF(btrim("CmsFooterContent"."authedCtaLabel"), ''), EXCLUDED."authedCtaLabel"),
  "authedCtaHref" = COALESCE(NULLIF(btrim("CmsFooterContent"."authedCtaHref"), ''), EXCLUDED."authedCtaHref"),
  "trustsLabel" = COALESCE(NULLIF(btrim("CmsFooterContent"."trustsLabel"), ''), EXCLUDED."trustsLabel"),
  "mobileMenuTitle" = COALESCE(NULLIF(btrim("CmsFooterContent"."mobileMenuTitle"), ''), EXCLUDED."mobileMenuTitle"),
  "mobileMenuLine" = COALESCE(NULLIF(btrim("CmsFooterContent"."mobileMenuLine"), ''), EXCLUDED."mobileMenuLine"),
  "updatedAt" = CURRENT_TIMESTAMP;

UPDATE "CmsHomeContent"
SET
  "heroEyebrow" = CASE
    WHEN "heroEyebrow" IS NULL OR "heroEyebrow" LIKE '%اطلس%' THEN 'LEARN · BUILD · GROW'
    ELSE "heroEyebrow"
  END,
  "heroTitle" = CASE
    WHEN "heroTitle" IS NULL OR btrim("heroTitle") = '' OR "heroTitle" IN ('ژرفا', 'DXCode')
    THEN 'از یادگیری کد تا درک مهندسی'
    ELSE "heroTitle"
  END,
  "updatedAt" = CURRENT_TIMESTAMP
WHERE "id" = 'home';
