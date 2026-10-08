"use client";
import { useEffect, useId, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TableKit } from "@tiptap/extension-table";
import {
  richHTML,
  richPlainText,
  sanitizeRichHTML,
  textHTML,
} from "./rich-text";
import type { Content } from "./content";

export function RichTextEditor({
  label,
  value,
  html,
  inline = false,
  onChange,
}: {
  label: string;
  value: string;
  html?: string;
  inline?: boolean;
  onChange: (text: string, html: string) => void;
}) {
  const id = useId();
  const [source, setSource] = useState<string | null>(null);
  const [link, setLink] = useState<string | null>(null);
  const [error, setError] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: inline ? false : { levels: [2, 3, 4] },
        bulletList: inline ? false : {},
        orderedList: inline ? false : {},
        blockquote: inline ? false : {},
        codeBlock: inline ? false : {},
        horizontalRule: false,
        link: inline ? false : { openOnClick: false },
      }),
      ...(inline ? [] : [TableKit]),
    ],
    content: html ?? textHTML(value),
    immediatelyRender: false,
    editorProps: {
      attributes: {
        role: "textbox",
        "aria-multiline": "true",
        "aria-labelledby": id,
        class: "rich-editor-document",
      },
    },
    onUpdate: ({ editor }) => {
      const clean = sanitizeRichHTML(editor.getHTML(), inline);
      onChange(richPlainText(clean), clean);
    },
  });
  useEditorState({ editor, selector: ({ editor }) => editor?.state });
  useEffect(() => {
    if (!editor) return;
    const current = sanitizeRichHTML(editor.getHTML(), inline);
    if (richPlainText(current) !== value || (html && current !== html))
      editor.commands.setContent(html ?? textHTML(value), {
        emitUpdate: false,
      });
  }, [editor, value, html, inline]);
  const button = (
    name: string,
    text: string,
    run: () => void,
    active = false,
    disabled = false,
  ) => (
    <button
      type="button"
      title={name}
      aria-label={name}
      aria-pressed={active}
      disabled={!editor || disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={run}
    >
      {text}
    </button>
  );
  return (
    <div className={"rich-editor" + (inline ? " rich-editor-compact" : "")}>
      <div id={id} className="rich-editor-label">
        {label}
      </div>
      <div className="rich-editor-frame">
        <div
          className="rich-editor-toolbar"
          role="group"
          aria-label={`${label} formatting`}
        >
          {button(
            "Bold",
            "B",
            () => editor?.chain().focus().toggleBold().run(),
            editor?.isActive("bold"),
          )}
          {button(
            "Italic",
            "I",
            () => editor?.chain().focus().toggleItalic().run(),
            editor?.isActive("italic"),
          )}
          {button(
            "Underline",
            "U",
            () => editor?.chain().focus().toggleUnderline().run(),
            editor?.isActive("underline"),
          )}
          {button(
            "Strikethrough",
            "S̶",
            () => editor?.chain().focus().toggleStrike().run(),
            editor?.isActive("strike"),
          )}
          {!inline && (
            <>
              <select
                aria-label="Text style"
                value={
                  editor?.isActive("heading", { level: 2 })
                    ? "2"
                    : editor?.isActive("heading", { level: 3 })
                      ? "3"
                      : "p"
                }
                onChange={(e) =>
                  e.target.value === "p"
                    ? editor?.chain().focus().setParagraph().run()
                    : editor
                        ?.chain()
                        .focus()
                        .setHeading({ level: Number(e.target.value) as 2 | 3 })
                        .run()
                }
              >
                <option value="p">Paragraph</option>
                <option value="2">Heading 2</option>
                <option value="3">Heading 3</option>
              </select>
              {button(
                "Bullet list",
                "• List",
                () => editor?.chain().focus().toggleBulletList().run(),
                editor?.isActive("bulletList"),
              )}
              {button(
                "Numbered list",
                "1. List",
                () => editor?.chain().focus().toggleOrderedList().run(),
                editor?.isActive("orderedList"),
              )}
              {button(
                "Quote",
                "Quote",
                () => editor?.chain().focus().toggleBlockquote().run(),
                editor?.isActive("blockquote"),
              )}
              {button(
                "Edit link",
                "Link",
                () => {
                  setLink(editor?.getAttributes("link").href ?? "");
                  setError("");
                },
                editor?.isActive("link"),
              )}
              {button("Insert table", "Table", () =>
                editor
                  ?.chain()
                  .focus()
                  .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
                  .run(),
              )}
              {editor?.isActive("table") && (
                <>
                  {button("Add row", "+ Row", () =>
                    editor.chain().focus().addRowAfter().run(),
                  )}
                  {button("Add column", "+ Column", () =>
                    editor.chain().focus().addColumnAfter().run(),
                  )}
                  {button("Delete row", "− Row", () =>
                    editor.chain().focus().deleteRow().run(),
                  )}
                  {button("Delete column", "− Column", () =>
                    editor.chain().focus().deleteColumn().run(),
                  )}
                  {button("Delete table", "Remove table", () =>
                    editor.chain().focus().deleteTable().run(),
                  )}
                </>
              )}
            </>
          )}
          {button("Clear formatting", "Clear", () =>
            editor?.chain().focus().unsetAllMarks().clearNodes().run(),
          )}
          {button(
            "Undo",
            "↶",
            () => editor?.chain().focus().undo().run(),
            false,
            !editor?.can().undo(),
          )}
          {button(
            "Redo",
            "↷",
            () => editor?.chain().focus().redo().run(),
            false,
            !editor?.can().redo(),
          )}
          {button("Paste HTML", "HTML", () => setSource(""))}
        </div>
        {link !== null && (
          <div className="rich-editor-panel">
            <label>
              Link URL
              <input
                autoFocus
                value={link}
                placeholder="https://…"
                onChange={(e) => setLink(e.target.value)}
              />
            </label>
            <button
              type="button"
              onClick={() => {
                if (
                  link &&
                  !/^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(link.trim())
                ) {
                  setError(
                    "Enter a web address, email, phone or internal path.",
                  );
                  return;
                }
                if (link.trim())
                  editor
                    ?.chain()
                    .focus()
                    .extendMarkRange("link")
                    .setLink({ href: link.trim() })
                    .run();
                else editor?.chain().focus().unsetLink().run();
                setLink(null);
              }}
            >
              Apply link
            </button>
            <button type="button" onClick={() => setLink(null)}>
              Cancel
            </button>
            {error && <p role="alert">{error}</p>}
          </div>
        )}
        {source !== null && (
          <div className="rich-editor-panel">
            <label>
              Paste HTML to insert at the cursor
              <textarea
                autoFocus
                value={source}
                onChange={(e) => setSource(e.target.value)}
              />
            </label>
            <p>
              Supported text formatting is kept. Scripts, embedded media and
              custom styles are removed.
            </p>
            <button
              type="button"
              disabled={!source.trim()}
              onClick={() => {
                editor
                  ?.chain()
                  .focus()
                  .insertContent(sanitizeRichHTML(source, inline))
                  .run();
                setSource(null);
              }}
            >
              Insert HTML
            </button>
            <button type="button" onClick={() => setSource(null)}>
              Cancel
            </button>
          </div>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}

export function ContentField({
  content,
  field,
  value,
  label,
  inline,
  change,
}: {
  content: Content;
  field: string;
  value: string;
  label: string;
  inline?: boolean;
  change: (text: string, richText: NonNullable<Content["richText"]>) => void;
}) {
  return (
    <RichTextEditor
      label={label}
      value={value}
      inline={inline}
      html={richHTML(content, field, value, inline)}
      onChange={(text, html) =>
        change(text, { ...content.richText, [field]: { text, html } })
      }
    />
  );
}
