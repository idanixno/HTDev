"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Notice } from "@zharfa/ui";
import { authFetch } from "../../lib/api-client";
import type { ChromeGroup, ChromeLink } from "../../lib/site-chrome";

export type FooterCmsInitial = {
  brandName: string;
  brandTagline: string;
  brandKicker: string;
  footerBlurb: string;
  headerLinks: ChromeLink[];
  footerGroups: ChromeGroup[];
  mobileGroups: ChromeGroup[];
  guestCtaLabel: string;
  guestCtaHref: string;
  authedCtaLabel: string;
  authedCtaHref: string;
  showCart: boolean;
  showThemeToggle: boolean;
  trustsLabel: string;
  mobileMenuTitle: string;
  mobileMenuLine: string;
  enamadHtml: string;
  paymentGatewayHtml: string;
};

function linksToText(links: ChromeLink[]) {
  return links.map((l) => `${l.label}|${l.href}${l.match && l.match !== l.href ? `|${l.match}` : ""}`).join("\n");
}

function textToLinks(text: string): ChromeLink[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, href, match] = line.split("|").map((p) => p.trim());
      return {
        label: label || "",
        href: href || "",
        match: match || href || "",
      };
    })
    .filter((l) => l.label && l.href);
}

function groupsToText(groups: ChromeGroup[]) {
  return groups
    .map((g) => {
      const body = g.links
        .map((l) => `  ${l.label}|${l.href}`)
        .join("\n");
      return `# ${g.label}\n${body}`;
    })
    .join("\n\n");
}

function textToGroups(text: string): ChromeGroup[] {
  const groups: ChromeGroup[] = [];
  let current: ChromeGroup | null = null;
  for (const raw of text.split("\n")) {
    const line = raw.trimEnd();
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.startsWith("#")) {
      if (current && current.links.length) groups.push(current);
      current = { label: trimmed.replace(/^#\s*/, "").trim(), links: [] };
      continue;
    }
    if (!current) current = { label: "منو", links: [] };
    const [label, href] = trimmed.split("|").map((p) => p.trim());
    if (label && href) current.links.push({ label, href });
  }
  if (current && current.links.length) groups.push(current);
  return groups;
}

export function FooterCmsEditorForm({
  initial,
}: {
  initial: FooterCmsInitial;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initial);
  const [headerText, setHeaderText] = useState(linksToText(initial.headerLinks));
  const [footerText, setFooterText] = useState(groupsToText(initial.footerGroups));
  const [mobileText, setMobileText] = useState(groupsToText(initial.mobileGroups));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  function patch(partial: Partial<FooterCmsInitial>) {
    setValues((prev) => ({ ...prev, ...partial }));
    setSaved(false);
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSaved(false);
    try {
      await authFetch("/api/admin/cms/footer", {
        method: "PATCH",
        body: JSON.stringify({
          brandName: values.brandName.trim() || null,
          brandTagline: values.brandTagline.trim() || null,
          brandKicker: values.brandKicker.trim() || null,
          footerBlurb: values.footerBlurb.trim() || null,
          headerLinks: textToLinks(headerText),
          footerGroups: textToGroups(footerText),
          mobileGroups: textToGroups(mobileText),
          guestCtaLabel: values.guestCtaLabel.trim() || null,
          guestCtaHref: values.guestCtaHref.trim() || null,
          authedCtaLabel: values.authedCtaLabel.trim() || null,
          authedCtaHref: values.authedCtaHref.trim() || null,
          showCart: values.showCart,
          showThemeToggle: values.showThemeToggle,
          trustsLabel: values.trustsLabel.trim() || null,
          mobileMenuTitle: values.mobileMenuTitle.trim() || null,
          mobileMenuLine: values.mobileMenuLine.trim() || null,
          enamadHtml: values.enamadHtml.trim() || null,
          paymentGatewayHtml: values.paymentGatewayHtml.trim() || null,
        }),
      });
      setSaved(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "ذخیرهٔ هدر و فوتر ناموفق بود.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="editor-form" onSubmit={onSubmit}>
      {error ? (
        <Notice tone="error" title="ذخیره نشد">
          {error}
        </Notice>
      ) : null}
      {saved ? (
        <Notice tone="success" title="ذخیره شد">
          هدر، فوتر و نشان‌های اعتماد به‌روز شد.
        </Notice>
      ) : null}

      <h3 className="admin-panel__subheading">برند</h3>
      <div className="editor-form__grid">
        <label className="z-field">
          <span className="z-field__label">نام برند</span>
          <input
            className="z-field__control"
            value={values.brandName}
            onChange={(e) => patch({ brandName: e.target.value })}
          />
        </label>
        <label className="z-field">
          <span className="z-field__label">شعار هدر</span>
          <input
            className="z-field__control"
            value={values.brandTagline}
            onChange={(e) => patch({ brandTagline: e.target.value })}
          />
        </label>
        <label className="z-field">
          <span className="z-field__label">کِیکر فوتر</span>
          <input
            className="z-field__control"
            value={values.brandKicker}
            onChange={(e) => patch({ brandKicker: e.target.value })}
            placeholder="استودیو"
          />
        </label>
        <label className="z-field editor-form__wide">
          <span className="z-field__label">متن معرفی فوتر</span>
          <textarea
            className="z-field__control"
            rows={7}
            maxLength={900}
            value={values.footerBlurb}
            onChange={(e) => patch({ footerBlurb: e.target.value })}
          />
        </label>
      </div>

      <h3 className="admin-panel__subheading">منوی هدر</h3>
      <p className="admin-table__muted" style={{ marginTop: 0 }}>
        هر خط: <code dir="ltr">برچسب|/مسیر</code> یا{" "}
        <code dir="ltr">برچسب|/مسیر|/match</code>
      </p>
      <label className="z-field editor-form__wide">
        <span className="z-field__label">لینک‌های ناوبری هدر</span>
        <textarea
          className="z-field__control"
          rows={5}
          dir="ltr"
          spellCheck={false}
          value={headerText}
          onChange={(e) => {
            setHeaderText(e.target.value);
            setSaved(false);
          }}
        />
      </label>

      <h3 className="admin-panel__subheading">دکمه‌ها و آیکون‌های هدر</h3>
      <div className="editor-form__grid">
        <label className="z-field">
          <span className="z-field__label">برچسب مهمان</span>
          <input
            className="z-field__control"
            value={values.guestCtaLabel}
            onChange={(e) => patch({ guestCtaLabel: e.target.value })}
          />
        </label>
        <label className="z-field">
          <span className="z-field__label">لینک مهمان</span>
          <input
            className="z-field__control"
            dir="ltr"
            value={values.guestCtaHref}
            onChange={(e) => patch({ guestCtaHref: e.target.value })}
          />
        </label>
        <label className="z-field">
          <span className="z-field__label">برچسب کاربر واردشده</span>
          <input
            className="z-field__control"
            value={values.authedCtaLabel}
            onChange={(e) => patch({ authedCtaLabel: e.target.value })}
          />
        </label>
        <label className="z-field">
          <span className="z-field__label">لینک کاربر واردشده</span>
          <input
            className="z-field__control"
            dir="ltr"
            value={values.authedCtaHref}
            onChange={(e) => patch({ authedCtaHref: e.target.value })}
          />
        </label>
        <label className="z-field" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={values.showCart}
            onChange={(e) => patch({ showCart: e.target.checked })}
          />
          <span className="z-field__label" style={{ margin: 0 }}>
            نمایش سبد خرید
          </span>
        </label>
        <label className="z-field" style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            type="checkbox"
            checked={values.showThemeToggle}
            onChange={(e) => patch({ showThemeToggle: e.target.checked })}
          />
          <span className="z-field__label" style={{ margin: 0 }}>
            نمایش تغییر تم
          </span>
        </label>
      </div>

      <h3 className="admin-panel__subheading">منوهای فوتر</h3>
      <p className="admin-table__muted" style={{ marginTop: 0 }}>
        گروه با <code># عنوان</code> و زیرش لینک‌ها:{" "}
        <code dir="ltr">برچسب|/مسیر</code>
      </p>
      <label className="z-field editor-form__wide">
        <span className="z-field__label">ستون‌های فوتر</span>
        <textarea
          className="z-field__control"
          rows={10}
          dir="rtl"
          spellCheck={false}
          value={footerText}
          onChange={(e) => {
            setFooterText(e.target.value);
            setSaved(false);
          }}
        />
      </label>

      <h3 className="admin-panel__subheading">منوی موبایل</h3>
      <div className="editor-form__grid">
        <label className="z-field">
          <span className="z-field__label">عنوان منو</span>
          <input
            className="z-field__control"
            value={values.mobileMenuTitle}
            onChange={(e) => patch({ mobileMenuTitle: e.target.value })}
          />
        </label>
        <label className="z-field editor-form__wide">
          <span className="z-field__label">خط توضیح منو</span>
          <input
            className="z-field__control"
            value={values.mobileMenuLine}
            onChange={(e) => patch({ mobileMenuLine: e.target.value })}
          />
        </label>
        <label className="z-field editor-form__wide">
          <span className="z-field__label">گروه‌های منوی موبایل</span>
          <textarea
            className="z-field__control"
            rows={10}
            spellCheck={false}
            value={mobileText}
            onChange={(e) => {
              setMobileText(e.target.value);
              setSaved(false);
            }}
          />
        </label>
      </div>

      <h3 className="admin-panel__subheading">نماد اعتماد و درگاه</h3>
      <p className="admin-table__muted" style={{ marginTop: 0 }}>
        کد HTML اینماد یا درگاه را بچسبانید (معمولاً لینک + تصویر). اسکریپت‌ها
        حذف می‌شوند.
      </p>
      <div className="editor-form__grid">
        <label className="z-field">
          <span className="z-field__label">عنوان بخش اعتماد</span>
          <input
            className="z-field__control"
            value={values.trustsLabel}
            onChange={(e) => patch({ trustsLabel: e.target.value })}
          />
        </label>
        <label className="z-field editor-form__wide">
          <span className="z-field__label">HTML اینماد</span>
          <textarea
            className="z-field__control"
            rows={5}
            dir="ltr"
            spellCheck={false}
            value={values.enamadHtml}
            onChange={(e) => patch({ enamadHtml: e.target.value })}
            placeholder='<a href="https://trustseal.enamad.ir/?id=..."><img src="..." alt="enamad" /></a>'
          />
        </label>
        <label className="z-field editor-form__wide">
          <span className="z-field__label">HTML درگاه پرداخت</span>
          <textarea
            className="z-field__control"
            rows={5}
            dir="ltr"
            spellCheck={false}
            value={values.paymentGatewayHtml}
            onChange={(e) => patch({ paymentGatewayHtml: e.target.value })}
            placeholder='<a href="..."><img src="..." alt="درگاه" /></a>'
          />
        </label>
      </div>

      <div className="editor-form__actions">
        <Button type="submit" loading={loading}>
          ذخیرهٔ هدر و فوتر
        </Button>
      </div>
    </form>
  );
}
