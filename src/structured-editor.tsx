"use client";
import { useState } from "react";
import type { Content } from "./content";
import { ContentField } from "./rich-text-editor";
import { richParagraphs } from "./rich-text";
import { isFAQSection } from "./faq-requirements";

export function StructuredEditor({
  content,
  change,
  regenerate,
  busy,
}: {
  content: Content;
  change: (v: Content) => void;
  regenerate?: (id: string) => void;
  busy: boolean;
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const update = (
    index: number,
    section: NonNullable<Content["sections"]>[number],
    richText = content.richText,
  ) =>
    change({
      ...content,
      richText,
      sections: content.sections?.map((s, i) => (i === index ? section : s)),
    });
  return (
    <>
      <div className="editor-card editor-hero-fields">
        <h3>Opening answer and CTA</h3>
        <p className="editor-section-hint">
          Paste formatted content directly, or use HTML to insert a snippet.
        </p>
        {(["heading", "body", "ctaLabel"] as const).map((key) => (
          <ContentField
            key={key}
            content={content}
            field={`hero.${key}`}
            value={content.hero?.[key] ?? ""}
            label={
              {
                heading: "Main heading (H1)",
                body: "Opening answer",
                ctaLabel: "Call-to-action label",
              }[key]
            }
            inline={key !== "body"}
            change={(text, richText) =>
              change({
                ...content,
                richText,
                hero: { ...content.hero!, [key]: text },
              })
            }
          />
        ))}
        <label>
          Call-to-action destination
          <input
            value={content.hero?.ctaPath ?? ""}
            onChange={(e) =>
              change({
                ...content,
                hero: { ...content.hero!, ctaPath: e.target.value },
              })
            }
          />
        </label>
      </div>
      <h3>Content sections</h3>
      {content.sections?.map((s, index) => {
        const prefix = `sections.${s.id}.`;
        const field = (
          key: string,
          value: string,
          label: string,
          apply: (text: string) => typeof s,
          inline = false,
        ) => (
          <ContentField
            key={key}
            content={content}
            field={prefix + key}
            value={value}
            label={label}
            inline={inline}
            change={(text, richText) => update(index, apply(text), richText)}
          />
        );
        return (
          <details
            key={s.id}
            className="editor-section-card"
            onToggle={(e) => {
              const open = e.currentTarget.open;
              setExpanded((previous) => {
                const next = new Set(previous);
                open ? next.add(s.id) : next.delete(s.id);
                return next;
              });
            }}
          >
            <summary>
              {s.level === 3 ? "H3" : "H2"} · {s.heading}
              {!!s.faqs.length && (
                <span className="editor-faq-count">{s.faqs.length} FAQs</span>
              )}
            </summary>
            {expanded.has(s.id) && (
              <div className="structured-fields">
                {regenerate && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => regenerate(s.id)}
                  >
                    Regenerate this section using saved settings
                  </button>
                )}
                {field(
                  "heading",
                  s.heading,
                  "Section heading",
                  (text) => ({ ...s, heading: text }),
                  true,
                )}
                {field(
                  "paragraphs",
                  s.paragraphs.join("\n\n"),
                  "Section content",
                  (text) => ({
                    ...s,
                    paragraphs: richParagraphs(text),
                  }),
                )}
                <div className="editor-field-group">
                  <h4>List items</h4>
                  {s.items.map((item, i) => (
                    <div key={i} className="editor-repeatable">
                      {field(
                        `items.${i}`,
                        item,
                        `Item ${i + 1}`,
                        (text) => ({
                          ...s,
                          items: s.items.map((v, n) => (n === i ? text : v)),
                        }),
                        true,
                      )}
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          update(index, {
                            ...s,
                            items: s.items.filter((_, n) => n !== i),
                          })
                        }
                      >
                        Remove item {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={s.items.length >= 30}
                    onClick={() =>
                      update(index, { ...s, items: [...s.items, ""] })
                    }
                  >
                    Add list item
                  </button>
                </div>
                <div className="editor-field-group">
                  <h4>Cards</h4>
                  {s.cards.map((card, i) => (
                    <div key={i} className="editor-repeatable">
                      {(["title", "body"] as const).map((key) =>
                        field(
                          `cards.${i}.${key}`,
                          card[key],
                          `Card ${i + 1} ${key}`,
                          (text) => ({
                            ...s,
                            cards: s.cards.map((v, n) =>
                              n === i ? { ...v, [key]: text } : v,
                            ),
                          }),
                          key === "title",
                        ),
                      )}
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          update(index, {
                            ...s,
                            cards: s.cards.filter((_, n) => n !== i),
                          })
                        }
                      >
                        Remove card {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={s.cards.length >= 20}
                    onClick={() =>
                      update(index, {
                        ...s,
                        cards: [...s.cards, { title: "", body: "" }],
                      })
                    }
                  >
                    Add card
                  </button>
                </div>
                <div className="editor-field-group">
                  <h4>Questions & answers</h4>
                  {isFAQSection(s.heading) && !s.faqs.length && (
                    <p>Add the questions this section should answer.</p>
                  )}
                  {s.faqs.map((faq, i) => (
                    <div key={i} className="editor-faq-pair">
                      {(["question", "answer"] as const).map((key) =>
                        field(
                          `faqs.${i}.${key}`,
                          faq[key],
                          `${key === "question" ? "Question" : "Answer"} ${i + 1}`,
                          (text) => ({
                            ...s,
                            faqs: s.faqs.map((v, n) =>
                              n === i ? { ...v, [key]: text } : v,
                            ),
                          }),
                          key === "question",
                        ),
                      )}
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() =>
                          update(index, {
                            ...s,
                            faqs: s.faqs.filter((_, n) => n !== i),
                          })
                        }
                      >
                        Remove question {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={s.faqs.length >= 30}
                    onClick={() =>
                      update(index, {
                        ...s,
                        faqs: [...s.faqs, { question: "", answer: "" }],
                      })
                    }
                  >
                    Add FAQ
                  </button>
                </div>
                <details className="editor-advanced">
                  <summary>Comparison table</summary>
                  <div className="editor-field-group">
                    {s.table.columns.map((column, i) => (
                      <div key={i} className="editor-repeatable">
                        {field(
                          `table.columns.${i}`,
                          column,
                          `Column ${i + 1}`,
                          (text) => ({
                            ...s,
                            table: {
                              ...s.table,
                              columns: s.table.columns.map((v, n) =>
                                n === i ? text : v,
                              ),
                            },
                          }),
                          true,
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            update(index, {
                              ...s,
                              table: {
                                columns: s.table.columns.filter(
                                  (_, n) => n !== i,
                                ),
                                rows: s.table.rows.map((row) =>
                                  row.filter((_, n) => n !== i),
                                ),
                              },
                            })
                          }
                        >
                          Remove column {i + 1}
                        </button>
                      </div>
                    ))}
                    {s.table.rows.map((row, i) => (
                      <div key={i} className="editor-repeatable">
                        <h4>Row {i + 1}</h4>
                        {row.map((cell, j) =>
                          field(
                            `table.rows.${i}.${j}`,
                            cell,
                            s.table.columns[j] || `Column ${j + 1}`,
                            (text) => ({
                              ...s,
                              table: {
                                ...s.table,
                                rows: s.table.rows.map((v, n) =>
                                  n === i
                                    ? v.map((x, k) => (k === j ? text : x))
                                    : v,
                                ),
                              },
                            }),
                            true,
                          ),
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            update(index, {
                              ...s,
                              table: {
                                ...s.table,
                                rows: s.table.rows.filter((_, n) => n !== i),
                              },
                            })
                          }
                        >
                          Remove row {i + 1}
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      disabled={s.table.columns.length >= 8}
                      onClick={() =>
                        update(index, {
                          ...s,
                          table: {
                            columns: [...s.table.columns, ""],
                            rows: s.table.rows.map((row) => [...row, ""]),
                          },
                        })
                      }
                    >
                      Add column
                    </button>
                    <button
                      type="button"
                      disabled={
                        !s.table.columns.length || s.table.rows.length >= 30
                      }
                      onClick={() =>
                        update(index, {
                          ...s,
                          table: {
                            ...s.table,
                            rows: [
                              ...s.table.rows,
                              s.table.columns.map(() => ""),
                            ],
                          },
                        })
                      }
                    >
                      Add row
                    </button>
                  </div>
                </details>
                <details className="editor-advanced">
                  <summary>Related links</summary>
                  {s.links.map((link, i) => (
                    <div key={i} className="editor-repeatable">
                      {field(
                        `links.${i}.label`,
                        link.label,
                        `Link ${i + 1} label`,
                        (text) => ({
                          ...s,
                          links: s.links.map((v, n) =>
                            n === i ? { ...v, label: text } : v,
                          ),
                        }),
                        true,
                      )}
                      <label>
                        Destination
                        <input
                          value={link.path}
                          onChange={(e) =>
                            update(index, {
                              ...s,
                              links: s.links.map((v, n) =>
                                n === i ? { ...v, path: e.target.value } : v,
                              ),
                            })
                          }
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() =>
                          update(index, {
                            ...s,
                            links: s.links.filter((_, n) => n !== i),
                          })
                        }
                      >
                        Remove link {i + 1}
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    disabled={s.links.length >= 20}
                    onClick={() =>
                      update(index, {
                        ...s,
                        links: [...s.links, { label: "", path: "/" }],
                      })
                    }
                  >
                    Add link
                  </button>
                </details>
              </div>
            )}
          </details>
        );
      })}
    </>
  );
}
