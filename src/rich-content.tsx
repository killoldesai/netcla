import type { Content } from "./content";
import { richHTML } from "./rich-text";

export function RichContent({
  content,
  field,
  text,
  block = false,
}: {
  content: Pick<Content, "richText">;
  field: string;
  text: string;
  block?: boolean;
}) {
  const html = richHTML(content, field, text, !block);
  if (!html)
    return block ? (
      <>
        {text.split(/\n\n+/).map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </>
    ) : (
      <>{text}</>
    );
  return block ? (
    <div className="content-rich" dangerouslySetInnerHTML={{ __html: html }} />
  ) : (
    <span dangerouslySetInnerHTML={{ __html: html }} />
  );
}
