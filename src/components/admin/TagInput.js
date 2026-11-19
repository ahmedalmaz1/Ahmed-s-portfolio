"use client";
import { useState } from "react";

const MAX_ITEMS = 20;
const MAX_LEN = 40;

/** Chips input: Enter or comma adds a tag, Backspace removes the last one. */
export default function TagInput({
  id,
  value,
  onChange,
  placeholder = "Type a tool and press Enter",
  ...aria
}) {
  const [draft, setDraft] = useState("");

  function add(raw) {
    const tag = raw.trim().slice(0, MAX_LEN);
    setDraft("");
    if (
      !tag ||
      value.length >= MAX_ITEMS ||
      value.some((t) => t.toLowerCase() === tag.toLowerCase())
    )
      return;
    onChange([...value, tag]);
  }

  return (
    <div className="flex min-h-11 flex-wrap items-center gap-2 rounded-lg border border-line bg-bg px-2.5 py-2 focus-within:border-[#7aa7ff]">
      {value.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 rounded-full bg-panel2 py-1 pl-3 pr-1 text-sm"
        >
          {tag}
          <button
            type="button"
            aria-label={`Remove ${tag}`}
            onClick={() => onChange(value.filter((t) => t !== tag))}
            className="grid size-6 place-items-center rounded-full text-mute hover:bg-line hover:text-ink"
          >
            ×
          </button>
        </span>
      ))}
      <input
        id={id}
        {...aria}
        value={draft}
        maxLength={MAX_LEN}
        disabled={value.length >= MAX_ITEMS}
        placeholder={value.length ? "" : placeholder}
        onChange={(e) =>
          e.target.value.endsWith(",")
            ? add(e.target.value.slice(0, -1))
            : setDraft(e.target.value)
        }
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault(); // don't submit the form
            add(draft);
          } else if (e.key === "Backspace" && !draft && value.length)
            onChange(value.slice(0, -1));
        }}
        onBlur={() => add(draft)}
        className="min-w-24 flex-1 bg-transparent py-1 text-base text-ink outline-none md:text-sm placeholder:text-mute/60"
      />
    </div>
  );
}
