import { RichContent } from "./rich-content";
import type { Content } from "./content";
export function PlannedContent({ content }: { content: Content }) {
  return (
    <div className="plan-preview">
      <section className="plan-hero">
        <span>NETOFFICIALS · PRIVATE CONTENT REVIEW</span>
        <h1>
          <RichContent
            content={content}
            field="hero.heading"
            text={content.hero?.heading ?? ""}
          />
        </h1>
        <RichContent
          content={content}
          field="hero.body"
          text={content.hero?.body || "Opening answer awaiting generation."}
          block
        />
        <a href={content.hero?.ctaPath ?? "/contact"}>
          <RichContent
            content={content}
            field="hero.ctaLabel"
            text={content.hero?.ctaLabel ?? ""}
          />
        </a>
      </section>
      <div className="plan-body">
        {content.sections?.map((s) => (
          <section key={s.id}>
            {s.level === 3 ? (
              <h3>
                <RichContent
                  content={content}
                  field={`sections.${s.id}.heading`}
                  text={s.heading}
                />
              </h3>
            ) : (
              <h2>
                <RichContent
                  content={content}
                  field={`sections.${s.id}.heading`}
                  text={s.heading}
                />
              </h2>
            )}
            <RichContent
              content={content}
              field={`sections.${s.id}.paragraphs`}
              text={s.paragraphs.join("\n\n")}
              block
            />
            {!!s.items.length && (
              <ul>
                {s.items.map((p, i) => (
                  <li key={i}>
                    <RichContent
                      content={content}
                      field={`sections.${s.id}.items.${i}`}
                      text={p}
                    />
                  </li>
                ))}
              </ul>
            )}
            {!!s.cards.length && (
              <div className="plan-cards">
                {s.cards.map((c, i) => (
                  <article key={i}>
                    <h3>
                      <RichContent
                        content={content}
                        field={`sections.${s.id}.cards.${i}.title`}
                        text={c.title}
                      />
                    </h3>
                    <RichContent
                      content={content}
                      field={`sections.${s.id}.cards.${i}.body`}
                      text={c.body}
                      block
                    />
                  </article>
                ))}
              </div>
            )}
            {!!s.table.rows.length && (
              <div style={{ overflowX: "auto" }}>
                <table>
                  <thead>
                    <tr>
                      {s.table.columns.map((c, i) => (
                        <th key={i}>
                          <RichContent
                            content={content}
                            field={`sections.${s.id}.table.columns.${i}`}
                            text={c}
                          />
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {s.table.rows.map((row, i) => (
                      <tr key={i}>
                        {row.map((v, j) => (
                          <td key={j}>
                            <RichContent
                              content={content}
                              field={`sections.${s.id}.table.rows.${i}.${j}`}
                              text={v}
                            />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {s.faqs.map((f, i) => (
              <details key={i}>
                <summary>
                  <RichContent
                    content={content}
                    field={`sections.${s.id}.faqs.${i}.question`}
                    text={f.question}
                  />
                </summary>
                <RichContent
                  content={content}
                  field={`sections.${s.id}.faqs.${i}.answer`}
                  text={f.answer}
                  block
                />
              </details>
            ))}
            {s.links.map((l, i) => (
              <p key={i}>
                <RichContent
                  content={content}
                  field={`sections.${s.id}.links.${i}.label`}
                  text={l.label}
                />{" "}
                · {l.path}
              </p>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
