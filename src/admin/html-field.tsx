"use client";
import { useState } from "react";
import { RichTextEditor } from "../rich-text-editor";
import { richPlainText, sanitizeRichHTML } from "../rich-text";

/**
 * Body copy editor with a Visual (rich text) and an HTML source mode.
 * Both modes store the same sanitised HTML; anything the site can't render
 * safely is removed when leaving source mode, and the owner is told.
 */
export function HtmlField({
  label,
  value,
  onChange,
  paths,
}: {
  label: string;
  value: string;
  onChange: (html: string) => void;
  paths: string[];
}) {
  const [mode, setMode] = useState<"visual" | "html">("visual");
  const [source, setSource] = useState(value);
  const [note, setNote] = useState("");
  const html = /<[a-z][\s\S]*>/i.test(value) ? value : value ? `<p>${value}</p>` : "";
  const words = richPlainText(html).split(/\s+/).filter(Boolean).length;

  const toVisual = () => {
    const clean = sanitizeRichHTML(source, false, paths.length ? paths : undefined);
    setNote(
      clean.replace(/\s+/g, "") !== source.replace(/\s+/g, "")
        ? "Some tags, attributes or links to unknown pages were removed because the site can't render them safely."
        : "",
    );
    onChange(clean);
    setMode("visual");
  };

  return (
    <div className="uc-html-field">
      <div className="uc-html-head">
        <span className="uc-html-label">{label}</span>
        <span className="uc-html-count">{words} words</span>
        <div className="uc-seg" role="group" aria-label={`${label} editing mode`}>
          <button type="button" aria-pressed={mode === "visual"} onClick={() => (mode === "html" ? toVisual() : undefined)}>
            Visual
          </button>
          <button
            type="button"
            aria-pressed={mode === "html"}
            onClick={() => {
              setSource(html.replace(/></g, ">\n<"));
              setNote("");
              setMode("html");
            }}
          >
            HTML
          </button>
        </div>
      </div>
      {mode === "visual" ? (
        <RichTextEditor label={label} value={richPlainText(html)} html={html} onChange={(_text, next) => onChange(next)} />
      ) : (
        <div className="uc-source">
          <ol aria-hidden="true">
            {source.split("\n").map((_, i) => (
              <li key={i} />
            ))}
          </ol>
          <textarea
            aria-label={`${label} HTML source`}
            spellCheck={false}
            value={source}
            rows={Math.min(30, Math.max(8, source.split("\n").length + 1))}
            onChange={(e) => setSource(e.target.value)}
            onBlur={() => onChange(sanitizeRichHTML(source, false, paths.length ? paths : undefined))}
          />
        </div>
      )}
      {mode === "html" && (
        <p className="uc-muted">
          Allowed: p, h3, h4, ul, ol, li, strong, em, a (internal paths or https), table. Other markup is removed when you switch back to Visual.
        </p>
      )}
      {note && (
        <p className="uc-run-note" role="status">
          {note}
        </p>
      )}
    </div>
  );
}
