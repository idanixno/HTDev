"use client";

import { useMemo, useState } from "react";

export type TopicOption = {
  id: string;
  name: string;
  slug: string;
  status?: string;
  parentTopicId?: string | null;
  parentName?: string | null;
};

/**
 * Multi-select for CourseTopic / JournalTopic.
 * Shows published topics by default; keeps already-selected draft topics visible.
 */
export function TopicMultiSelect({
  options,
  value,
  onChange,
  label = "موضوعات مرتبط",
  hint = "فقط از موضوعات موجود انتخاب کنید؛ موضوع جدید از بخش موضوعات ساخته می‌شود.",
}: {
  options: TopicOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  hint?: string;
}) {
  const [query, setQuery] = useState("");

  const byId = useMemo(() => {
    const map = new Map(options.map((o) => [o.id, o]));
    return map;
  }, [options]);

  const selected = useMemo(
    () => value.map((id) => byId.get(id)).filter(Boolean) as TopicOption[],
    [value, byId],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return options
      .filter((o) => o.status === "PUBLISHED" || value.includes(o.id))
      .filter((o) => {
        if (!q) return true;
        return (
          o.name.toLowerCase().includes(q) ||
          o.slug.toLowerCase().includes(q) ||
          (o.parentName ?? "").toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const aLabel = a.parentName ? `${a.parentName} / ${a.name}` : a.name;
        const bLabel = b.parentName ? `${b.parentName} / ${b.name}` : b.name;
        return aLabel.localeCompare(bLabel, "fa");
      });
  }, [options, query, value]);

  function toggle(id: string) {
    if (value.includes(id)) {
      onChange(value.filter((x) => x !== id));
      return;
    }
    onChange([...value, id]);
  }

  function remove(id: string) {
    onChange(value.filter((x) => x !== id));
  }

  return (
    <fieldset className="editor-form__fieldset topic-multi-select">
      <legend>{label}</legend>
      <p className="admin-page__hint">{hint}</p>

      {selected.length > 0 ? (
        <ul className="topic-multi-select__chips">
          {selected.map((topic) => (
            <li key={topic.id}>
              <span>
                {topic.parentName ? `${topic.parentName} / ` : ""}
                {topic.name}
                {topic.status && topic.status !== "PUBLISHED" ? (
                  <em> ({topic.status})</em>
                ) : null}
              </span>
              <button
                type="button"
                className="topic-multi-select__remove"
                onClick={() => remove(topic.id)}
                aria-label={`حذف ${topic.name}`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="topic-multi-select__empty">موضوعی انتخاب نشده.</p>
      )}

      <input
        type="search"
        className="field__control"
        placeholder="جست‌وجوی موضوع…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        dir="rtl"
      />

      <div className="editor-form__checklist topic-multi-select__list">
        {filtered.length === 0 ? (
          <p className="topic-multi-select__empty">موضوعی پیدا نشد.</p>
        ) : (
          filtered.map((topic) => {
            const checked = value.includes(topic.id);
            const labelText = topic.parentName
              ? `${topic.parentName} / ${topic.name}`
              : topic.name;
            return (
              <label key={topic.id} className="field field--checkbox">
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggle(topic.id)}
                />
                <span>
                  {labelText}
                  <code dir="ltr">/{topic.slug}</code>
                </span>
              </label>
            );
          })
        )}
      </div>
    </fieldset>
  );
}
