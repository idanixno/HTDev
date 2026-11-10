-- Footer trust badge HTML snippets (Enamad + payment gateway), edited in admin CMS.
CREATE TABLE "CmsFooterContent" (
    "id" TEXT NOT NULL DEFAULT 'footer',
    "enamadHtml" TEXT,
    "paymentGatewayHtml" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsFooterContent_pkey" PRIMARY KEY ("id")
);
