"use client";

import dynamic from "next/dynamic";
import { useId, useMemo, type ReactElement } from "react";
import {
  commands,
  type ICommand,
  type TextAreaTextApi,
} from "@uiw/react-md-editor";
import { ArticleBody } from "../article-body";
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => <div className="md-editor__loading">بارگذاری ویرایشگر…</div>,
});

function labelIcon(text: string): ReactElement {
  return <span className="md-editor__cmd-label">{text}</span>;
}

function withFa(cmd: ICommand, title: string): ICommand {
  return {
    ...cmd,
    buttonProps: {
      ...(cmd.buttonProps ?? {}),
      title,
      "aria-label": title,
    },
  };
}

function insertSnippet(api: TextAreaTextApi, snippet: string) {
  api.replaceSelection(snippet);
}

function zharfaVideo(): ICommand {
  return {
    name: "zharfa-video",
    keyCommand: "zharfa-video",
    buttonProps: { "aria-label": "ویدیو", title: "ویدیو" },
    icon: labelIcon("ویدیو"),
    execute: (_state, api) => {
      const src = window.prompt("مسیر یا نشانی ویدیو", "/media/intro.mp4");
      if (!src) return;
      const caption = window.prompt("عنوان ویدیو", "ویدیو") ?? "ویدیو";
      insertSnippet(api, `!video[${caption}](${src.trim()})`);
    },
  };
}

function zharfaFaq(): ICommand {
  return {
    name: "zharfa-faq",
    keyCommand: "zharfa-faq",
    buttonProps: { "aria-label": "پرسش‌وپاسخ", title: "پرسش‌وپاسخ" },
    icon: labelIcon("پرسش"),
    execute: (state, api) => {
      const answer = state.selectedText || "پاسخ این پرسش";
      insertSnippet(api, `!faq[سؤال شما]\n${answer}\n!/faq\n`);
    },
  };
}

function zharfaCourse(): ICommand {
  return {
    name: "zharfa-course",
    keyCommand: "zharfa-course",
    buttonProps: { "aria-label": "کارت دوره", title: "کارت دوره" },
    icon: labelIcon("دوره"),
    execute: (_state, api) => {
      const slug = window.prompt("اسلاگ دوره", "clean-architecture");
      if (!slug) return;
      insertSnippet(api, `!course[${slug.trim()}]`);
    },
  };
}

const BASIC_NAMES = new Set([
  "bold",
  "italic",
  "link",
  "unordered-list",
  "quote",
]);

function buildCommands(variant: "full" | "basic"): ICommand[] {
  const base = [
    withFa(commands.bold, "بولد"),
    withFa(commands.italic, "ایتالیک"),
    withFa(commands.strikethrough, "خط‌خورده"),
    withFa(commands.hr, "خط جداکننده"),
    commands.divider,
    withFa(commands.title2, "عنوان H2"),
    withFa(commands.title3, "زیرعنوان H3"),
    withFa(commands.title4, "عنوان H4"),
    commands.divider,
    withFa(commands.link, "لینک"),
    withFa(commands.quote, "نقل‌قول"),
    withFa(commands.code, "کد درون‌خطی"),
    withFa(commands.codeBlock, "بلوک کد"),
    withFa(commands.comment, "کامنت"),
    commands.divider,
    withFa(commands.unorderedListCommand, "فهرست"),
    withFa(commands.orderedListCommand, "فهرست شماره‌دار"),
    withFa(commands.checkedListCommand, "چک‌لیست"),
    commands.divider,
    withFa(commands.table, "جدول"),
    withFa(commands.image, "عکس"),
  ];

  if (variant === "basic") {
    return base.filter((cmd) => !cmd.name || BASIC_NAMES.has(cmd.name));
  }

  return [
    ...base,
    commands.divider,
    zharfaVideo(),
    zharfaFaq(),
    zharfaCourse(),
  ];
}

const EXTRA_COMMANDS: ICommand[] = [
  withFa(commands.codeEdit, "فقط ویرایش"),
  withFa(commands.codeLive, "ویرایش + پیش‌نمایش"),
  withFa(commands.codePreview, "فقط پیش‌نمایش"),
  commands.divider,
  withFa(commands.fullscreen, "تمام‌صفحه"),
];

export function MarkdownEditor({
  id,
  name,
  label,
  value,
  onChange,
  rows = 16,
  required,
  minLength,
  maxLength = 60000,
  hint,
  variant = "full",
  dir = "rtl",
}: {
  id?: string;
  name?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  hint?: string;
  variant?: "full" | "basic";
  dir?: "rtl" | "ltr" | "auto";
}) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const toolbar = useMemo(() => buildCommands(variant), [variant]);
  const height = Math.max(280, rows * 22);

  return (
    <div className="md-editor z-field editor-form__wide">
      <label className="z-field__label" htmlFor={fieldId}>
        {label}
      </label>
      <div className="md-editor__shell" data-color-mode="dark">
        <MDEditor
          id={fieldId}
          value={value}
          onChange={(next) => onChange(next ?? "")}
          preview="live"
          direction={dir === "auto" ? "rtl" : dir}
          height={height}
          visibleDragbar
          highlightEnable={false}
          commands={toolbar}
          extraCommands={EXTRA_COMMANDS}
          textareaProps={{
            id: fieldId,
            name,
            required,
            minLength,
            maxLength,
            "aria-label": label,
          }}
          components={{
            preview: (source) => (
              <div className="md-editor__preview reading">
                <ArticleBody body={source} />
              </div>
            ),
          }}
        />
      </div>
      {hint ? <span className="z-field__hint">{hint}</span> : null}
    </div>
  );
}
