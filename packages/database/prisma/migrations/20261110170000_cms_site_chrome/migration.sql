-- Expand footer CMS into full site chrome (header + footer + trusts).
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "brandName" TEXT NOT NULL DEFAULT 'ژرفا';
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "brandTagline" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "brandKicker" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "footerBlurb" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "headerLinks" JSONB;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "footerGroups" JSONB;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "mobileGroups" JSONB;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "guestCtaLabel" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "guestCtaHref" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "authedCtaLabel" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "authedCtaHref" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "showCart" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "showThemeToggle" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "trustsLabel" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "mobileMenuTitle" TEXT;
ALTER TABLE "CmsFooterContent" ADD COLUMN IF NOT EXISTS "mobileMenuLine" TEXT;

UPDATE "CmsFooterContent"
SET
  "brandTagline" = COALESCE("brandTagline", 'اطلس یادگیری عمیق'),
  "brandKicker" = COALESCE("brandKicker", 'استودیو'),
  "footerBlurb" = COALESCE(
    "footerBlurb",
    'آموزش فنی یک مدرس. هر دوره جدا فروخته می‌شود و ویدیوی محافظت‌شده در اسپات‌پلیر پخش می‌شود.'
  ),
  "headerLinks" = COALESCE(
    "headerLinks",
    '[{"href":"/courses","label":"دوره‌ها","match":"/courses"},{"href":"/paths","label":"مسیرها","match":"/paths"},{"href":"/journal","label":"مقالات","match":"/journal"}]'::jsonb
  ),
  "footerGroups" = COALESCE(
    "footerGroups",
    '[{"label":"یادگیری","links":[{"href":"/courses","label":"دوره‌ها"},{"href":"/paths","label":"مسیرهای یادگیری"},{"href":"/journal","label":"مقالات"}]},{"label":"ژرفا","links":[{"href":"/faq","label":"پرسش‌های رایج"},{"href":"/terms","label":"شرایط استفاده"}]}]'::jsonb
  ),
  "mobileGroups" = COALESCE(
    "mobileGroups",
    '[{"label":"یادگیری","links":[{"href":"/courses","label":"دوره‌ها"},{"href":"/paths","label":"مسیرهای یادگیری"},{"href":"/journal","label":"مقالات"}]},{"label":"ژرفا","links":[{"href":"/faq","label":"پرسش‌ها"},{"href":"/terms","label":"شرایط استفاده"}]}]'::jsonb
  ),
  "guestCtaLabel" = COALESCE("guestCtaLabel", 'ورود'),
  "guestCtaHref" = COALESCE("guestCtaHref", '/login'),
  "authedCtaLabel" = COALESCE("authedCtaLabel", 'حساب من'),
  "authedCtaHref" = COALESCE("authedCtaHref", '/dashboard'),
  "trustsLabel" = COALESCE("trustsLabel", 'اعتماد و پرداخت'),
  "mobileMenuTitle" = COALESCE("mobileMenuTitle", 'منو'),
  "mobileMenuLine" = COALESCE("mobileMenuLine", 'دوره‌ها، مسیرها و حساب — یک صفحه.')
WHERE "id" = 'footer';
