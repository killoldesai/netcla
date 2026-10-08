"use client";
import { mediaPath } from "./media-path";
import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  adminFetch,
  useAdminData,
  Panel,
  Tabs,
  Badge,
  Drawer,
  GenerationForm,
  date,
  Empty,
} from "./admin-console";
import { StructuredEditor } from "./structured-editor";
import { ContentField } from "./rich-text-editor";
import { iconKeys, componentNames } from "./page-spec-schema";
import type { Content } from "./content";
import { HtmlField } from "./admin/html-field";
import { SectionImage } from "./admin/section-image";
import { runContentQA } from "./content-qa";
import { htmlFieldPattern } from "./prompts/system";
export function ConsoleEditor({
  id,
  action,
  busy,
}: {
  id: string;
  action: (path: string, body: unknown, success?: string) => Promise<boolean>;
  busy: boolean;
}) {
  const { data, error, refresh } = useAdminData("pages", "id=" + id);
  const options = useAdminData("options", "");
  const production = useAdminData("page-generation", "id=" + id, 10000);
  const [content, setContent] = useState<Content | null>(null),
    [tab, setTab] = useState("content"),
    [active, setActive] = useState(""),
    [viewport, setViewport] = useState("desktop"),
    [generation, setGeneration] = useState<string | null>(null),
    [settings, setSettings] = useState<any>(null),
    [selected, setSelected] = useState<string[]>([]),
    [comparison, setComparison] = useState<any>(null),
    [compareError, setCompareError] = useState("");
  const [saved, setSaved] = useState(""),
    [baseRevision, setBaseRevision] = useState<string | null>(null),
    [autosave, setAutosave] = useState<{ at?: Date; error?: string }>({});
  const previewFrame = useRef<HTMLIFrameElement>(null);
  const dirty = !!content && !!data && JSON.stringify(content) !== saved;
  const loadedGeneration = useRef<string | null>(null);
  const generatedRun = production.data?.run;
  useEffect(() => {
    if (!data || dirty || !generatedRun?.result_revision_id) return;
    if (generatedRun.result_revision_id !== generatedRun.draft_revision_id) return;
    if (generatedRun.result_revision_id === data.page.draft_revision_id) return;
    if (loadedGeneration.current === generatedRun.result_revision_id) return;
    loadedGeneration.current = generatedRun.result_revision_id;
    refresh();
  }, [generatedRun?.result_revision_id, generatedRun?.draft_revision_id, data, dirty]);
  useEffect(() => {
    if (data) {
      setContent(data.page.content);
      setSaved(JSON.stringify(data.page.content));
      setBaseRevision(data.page.draft_revision_id);
      setActive((current) =>
        data.page.content?.pageSections?.some((s: any) => s.id === current)
          ? current
          : (data.page.content?.pageSections?.[0]?.id ?? ""),
      );
    }
  }, [data]);
  useEffect(() => {
    if (!dirty) return;
    const prevent = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    const guard = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest("a");
      if (
        link &&
        !link.hasAttribute("target") &&
        link.getAttribute("href") &&
        !link.getAttribute("href")!.startsWith("#") &&
        !confirm("Leave without saving your edits?")
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };
    addEventListener("beforeunload", prevent);
    document.addEventListener("click", guard, true);
    return () => {
      removeEventListener("beforeunload", prevent);
      document.removeEventListener("click", guard, true);
    };
  }, [dirty]);
  // Autosave version-three drafts every 10 seconds while there are edits.
  useEffect(() => {
    if (!dirty || busy || !content || content.schemaVersion !== 3 || !baseRevision || autosave.error) return;
    const timer = setTimeout(async () => {
      const snapshot = JSON.stringify(content);
      try {
        const result = await adminFetch("/api/admin/console/pages", {
          action: "save-v3",
          id,
          baseRevisionId: baseRevision,
          content,
        });
        setSaved(snapshot);
        if (result.revisionId) setBaseRevision(result.revisionId);
        setAutosave({ at: new Date() });
      } catch (e) {
        setAutosave({ error: e instanceof Error ? e.message : "Autosave failed" });
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [content, dirty, busy, baseRevision, autosave.error, id]);
  useEffect(() => {
    if (tab !== "preview" || !content) return;
    const send = () =>
      previewFrame.current?.contentWindow?.postMessage(
        {
          type: "netofficials-preview",
          content,
          path: data?.page.path,
          paths: options.data?.destinations?.map((d: any) => d.path) ?? [],
        },
        location.origin,
      );
    send();
    const ready = (event: MessageEvent) => {
      if (event.origin === location.origin && event.data?.type === "netofficials-preview-ready") send();
    };
    addEventListener("message", ready);
    return () => removeEventListener("message", ready);
  }, [tab, content, data, options.data]);
  if (error) return <p role="alert">{error}</p>;
  if (!data || !content) return <Empty title="Loading page editor…" />;
  const p = data.page,
    version = content.schemaVersion,
    section = content.pageSections?.find((s) => s.id === active),
    spec = data.spec?.sections?.find((s: any) => s.id === active);
  const fields = section?.fields ?? {};
  const change = (name: string, value: string) =>
    setContent({
      ...content,
      pageSections: content.pageSections?.map((s) =>
        s.id === active ? { ...s, fields: { ...s.fields, [name]: value } } : s,
      ),
    });
  const groups = new Map<string, string[]>();
  // Proof fields stay blank unless backed by approved evidence; hide them when empty
  // so the editor doesn't look like content is missing.
  const hiddenWhenEmpty = /^(?:stat_\d+_|quote_|client_|leader_|award_|certification_|office_|role_\d+_)/;
  for (const key of spec?.fields ?? Object.keys(fields)) {
    if (hiddenWhenEmpty.test(key) && !fields[key]?.trim() && !data?.facts?.length) continue;
    // Icons are chosen automatically from each card's title (src/icon-set.tsx).
    if (/(?:icon_key|_icon)$/.test(key)) continue;
    const match = key.match(/^(.+?_\d+)_/);
    const group = match?.[1] ?? "Section copy";
    groups.set(group, [...(groups.get(group) ?? []), key]);
  }
  async function save() {
    const ok = await action(
      "/api/admin/console/pages",
      {
        action: version === 3 ? "save-v3" : "save-legacy",
        id,
        baseRevisionId: baseRevision ?? p.draft_revision_id,
        content,
      },
      "Draft saved",
    );
    if (ok) {
      setAutosave({});
      refresh();
    }
    return ok;
  }
  const destinations: string[] = options.data?.destinations?.map((d: any) => d.path) ?? [];
  const qa = version === 3 ? runContentQA(content, p.path) : null;
  async function publish() {
    if (dirty && !(await save())) return;
    const failing = qa?.checks.filter((c) => c.status === "fail") ?? [];
    let override: string | undefined;
    if (failing.length) {
      const reason = prompt(
        "This page fails quality checks:\n\n" +
          failing.map((c) => "• " + c.label + (c.detail ? " (" + c.detail + ")" : "")).join("\n") +
          "\n\nFix them in the QA tab, or type a reason to publish anyway:",
      );
      if (!reason?.trim()) return;
      override = reason.trim();
    }
    if (await action("/api/admin", { action: "publish", id, ...(override ? { override } : {}) }, "Page published"))
      refresh();
  }
  async function start(scope: string) {
    setSettings(await adminFetch("/api/admin/console/settings"));
    setGeneration(scope);
  }
  const validation = p.validation ?? { errors: [], warnings: [] };
  return (
    <div className="uc-editor">
      <div className="uc-editor-top">
      <Link href="/admin/sitemap">← Site map</Link>
      <button
        className="uc-text-button"
        onClick={() => {
          if (
            !dirty ||
            confirm("Discard unsaved edits and reload the saved draft?")
          )
            refresh();
        }}
      >
        Reload saved draft
      </button>
      </div>
      <datalist id="editor-destinations">
        {options.data?.destinations?.map((destination: any) => (
          <option key={destination.path} value={destination.path}>
            {destination.title}
          </option>
        ))}
      </datalist>
      <div className="uc-editor-heading">
        <div>
          <h2>{content.seo?.metaTitle || content.title || p.title}</h2>
          <p>{p.path}</p>
        </div>
        <div className="uc-editor-status">
          <span className={"uc-loz " + (p.published_revision_id ? "uc-loz-done" : "uc-loz-todo")}>
            {p.published_revision_id ? "Live" : "Not published"}
          </span>
          {p.draft_revision_id !== p.published_revision_id && (
            <span className="uc-loz uc-loz-review">Draft differs from live</span>
          )}
          <span className={"uc-loz " + (dirty ? "uc-loz-progress" : "uc-loz-todo")}>{dirty ? "Unsaved changes" : "Saved"}</span>
          {qa && (
            <span className={"uc-score " + (qa.score >= 80 ? "good" : qa.score >= 60 ? "ok" : "low")} title="Quality score">
              {qa.score}
            </span>
          )}
          {version !== 3 && (
            <p className="uc-muted">Older page format. Regenerate the page to use the new editor, SEO and quality tools.</p>
          )}
        </div>
      </div>
      {production.data?.run && <div className="uc-generation-progress" role="status" aria-live="polite">
        <div><strong>Content generation</strong><Badge value={production.data.run.status} /><Link href="/admin/production">View production</Link></div>
        <progress aria-label="Generation tasks completed" max={Math.max(1, production.data.run.total)} value={production.data.run.completed} />
        <p>{production.data.run.completed} of {production.data.run.total} tasks complete{production.data.run.failed ? ` · ${production.data.run.failed} failed` : ""}{production.data.run.active ? ` · Working on ${production.data.run.active}` : ""}.</p>
        {production.data.run.result_revision_id && <p>{production.data.run.result_revision_id !== production.data.run.draft_revision_id ? "Generated result is retained separately because the draft changed during generation. Open Production to review it." : production.data.run.result_revision_id === p.draft_revision_id ? "Latest generated draft loaded. Publish it to update the live page." : dirty ? "New generated draft ready. Your unsaved edits are preserved." : "Loading the new generated draft…"}</p>}
        {production.data.run.result_revision_id === production.data.run.draft_revision_id && production.data.run.result_revision_id !== p.draft_revision_id && <button type="button" className="uc-button" onClick={() => { if (!dirty || confirm("Discard unsaved edits and load the newly generated draft?")) refresh(); }}>Load generated draft</button>}
      </div>}
      {production.error && <p role="alert">Generation status unavailable: {production.error}</p>}
      <Tabs
        names={version === 3 ? ["content", "seo", "qa", "preview", "assets", "history"] : ["content", "seo", "structure", "assets", "preview", "history"]}
        active={tab}
        change={setTab}
      />
      {tab === "content" && version === 3 && (
        <div className="uc-editor-grid">
          <aside className="uc-section-nav">
            <h3>Sections</h3>
            {content.pageSections?.map((s) => (
              <div key={s.id}>
                <button
                  aria-pressed={active === s.id}
                  onClick={() => setActive(s.id)}
                >
                  {data.spec?.sections?.find((v: any) => v.id === s.id)?.name ??
                    s.id}
                </button>
                <label className="uc-checkbox">
                  <input
                    type="checkbox"
                    aria-label={"Select " + s.id + " for regeneration"}
                    checked={selected.includes(s.id)}
                    onChange={(e) =>
                      setSelected(
                        e.target.checked
                          ? [...selected, s.id]
                          : selected.filter((v) => v !== s.id),
                      )
                    }
                  />
                  Regenerate
                </label>
              </div>
            ))}
            <button
              disabled={!selected.length || dirty || busy}
              onClick={() => start("sections")}
            >
              Regenerate selected copy
            </button>
          </aside>
          <Panel title={spec?.name ?? active}>
            {section && (section.asset || /hero|overview|editorial|deliver|who-its-for|mission/.test(section.id)) && (
              <SectionImage
                section={section}
                path={p.path}
                baseRevisionId={baseRevision ?? p.draft_revision_id}
                dirty={dirty}
                busy={busy}
                generating={["queued", "running"].includes(production.data?.run?.status)}
                action={action}
                onChange={(asset) =>
                  setContent({
                    ...content,
                    pageSections: content.pageSections?.map((x) => {
                      if (x.id !== active) return x;
                      if (asset) return { ...x, asset };
                      const { asset: _removed, ...rest } = x;
                      return rest;
                    }),
                  })
                }
              />
            )}
            {[...groups].map(([group, keys]) => (
              <fieldset className="uc-field-group" key={group}>
                <legend>{group.replaceAll("_", " ")}</legend>
                {keys.map((key) =>
                  htmlFieldPattern.test(key) ? (
                    // Rich fields carry their own label; a <label> wrapper would steal clicks.
                    <HtmlField
                      key={key}
                      label={fieldLabel(key)}
                      value={fields[key] ?? ""}
                      paths={destinations}
                      onChange={(html) => change(key, html)}
                    />
                  ) : (
                  <label key={key}>
                    {fieldLabel(key)}
                    {/icon(?:_key)?$/.test(key) ? (
                      <select
                        value={fields[key] ?? ""}
                        onChange={(e) => change(key, e.target.value)}
                      >
                        <option value="">No icon</option>
                        {iconKeys.map((icon) => (
                          <option key={icon}>{icon}</option>
                        ))}
                      </select>
                    ) : /body|answer|description|problem|solution|subtitle|subheadline|paragraph|bio|quote/.test(
                        key,
                      ) ? (
                      <textarea
                        rows={3}
                        value={fields[key] ?? ""}
                        onChange={(e) => change(key, e.target.value)}
                      />
                    ) : (
                      <input
                        list={
                          /(?:url|path|href)$/.test(key)
                            ? "editor-destinations"
                            : undefined
                        }
                        value={fields[key] ?? ""}
                        onChange={(e) => change(key, e.target.value)}
                      />
                    )}
                    {/(?:url|path|href)$/.test(key) &&
                      fields[key] &&
                      options.data &&
                      !options.data.destinations.some(
                        (d: any) => d.path === fields[key],
                      ) && (
                        <small role="alert">
                          Choose an existing page URL. Planned pages are
                          included.
                        </small>
                      )}
                  </label>
                  ),
                )}
              </fieldset>
            ))}
            {data.facts.length > 0 && <details>
              <summary>Verified evidence</summary>
              <p>Attach approved facts to any proof claims in this section.</p>
              {data.facts.map((f: any) => (
                <label className="uc-checkbox" key={f.id}>
                  <input
                    type="checkbox"
                    checked={section?.evidenceIds.includes(f.id) ?? false}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        pageSections: content.pageSections?.map((s) =>
                          s.id === active
                            ? {
                                ...s,
                                evidenceIds: e.target.checked
                                  ? [...s.evidenceIds, f.id]
                                  : s.evidenceIds.filter((id) => id !== f.id),
                              }
                            : s,
                        ),
                      })
                    }
                  />
                  {f.statement}
                </label>
              ))}
            </details>}
          </Panel>
        </div>
      )}
      {tab === "content" && version !== 3 && (
        <Panel title="Page copy">
          {version === 2 ? (
            <StructuredEditor
              content={content}
              change={setContent}
              busy={busy}
            />
          ) : (
            Object.entries(content.texts).map(([key, value]) => (
              <ContentField
                key={key}
                label={key}
                content={content}
                field={`texts.${key}`}
                value={value}
                change={(text, richText) =>
                  setContent({
                    ...content,
                    richText,
                    texts: { ...content.texts, [key]: text },
                  })
                }
              />
            ))
          )}
        </Panel>
      )}
      {tab === "seo" && (
        <SeoPanel content={content} path={p.path} change={setContent} />
      )}
      {tab === "qa" && qa && (
        <Panel title={`Quality score ${qa.score}/100`}>
          <p className="uc-muted">Checks update as you edit. Failing checks block publishing unless you record a reason.</p>
          <ul className="uc-qa">
            {qa.checks.map((c) => (
              <li key={c.id} className={"qa-" + c.status}>
                <span className={"uc-loz " + (c.status === "pass" ? "uc-loz-done" : c.status === "warn" ? "uc-loz-review" : "uc-loz-failed")}>{c.status}</span>
                <strong>{c.label}</strong>
                {c.detail && <small>{c.detail}</small>}
              </li>
            ))}
          </ul>
        </Panel>
      )}
      {tab === "structure" && (
        <Panel title="Imported page structure">
          {data.spec ? (
            <>
              <p>
                {data.spec.source} · {data.spec.sections.length} ordered
                sections
              </p>
              {data.spec.sections.map((s: any) => (
                <details key={s.id}>
                  <summary>
                    {s.name} · {s.id}
                  </summary>
                  <p>
                    {s.layout} {s.hero ? `· illustration ${s.ratio}` : ""}
                  </p>
                  {version === 3 && content.pageBlueprint?.[s.id] && (
                    <label>
                      Approved component
                      <select
                        value={
                          content.pageBlueprint[s.id].recommended_component
                        }
                        onChange={(e) =>
                          setContent({
                            ...content,
                            pageBlueprint: {
                              ...content.pageBlueprint!,
                              [s.id]: {
                                ...content.pageBlueprint![s.id],
                                recommended_component: e.target
                                  .value as (typeof componentNames)[number],
                              },
                            },
                          })
                        }
                      >
                        {componentNames
                          .filter((c) =>
                            s.id === "hero"
                              ? ["HeroSplit", "HeroFull"].includes(c)
                              : s.id === "cta-banner"
                                ? c === "DarkCtaBand"
                                : true,
                          )
                          .map((c) => (
                            <option key={c}>{c}</option>
                          ))}
                      </select>
                    </label>
                  )}
                  <p>Fields: {s.fields.join(", ")}</p>
                  <details>
                    <summary>Original content instructions</summary>
                    <pre>{s.originalPrompt}</pre>
                  </details>
                </details>
              ))}
            </>
          ) : (
            <p>This page retains its legacy structure.</p>
          )}
        </Panel>
      )}
      {tab === "assets" && version === 3 && (
        <Panel title="Page images">
          <p className="uc-muted">
            Generated images need acceptance in Media before publishing. Uploads are accepted automatically. Alt text describes the image for screen readers and search engines.
          </p>
          {content.pageSections?.map((s) => (
            <div className="uc-editor-asset" key={s.id}>
              <h4>{data.spec?.sections?.find((v: any) => v.id === s.id)?.name ?? s.id}</h4>
              {s.asset ? (
                <>
                  <img src={mediaPath(s.asset)} alt={s.asset.alt} />
                  <label>
                    Alt text
                    <input
                      value={s.asset.alt}
                      maxLength={300}
                      onChange={(e) =>
                        setContent({
                          ...content,
                          pageSections: content.pageSections?.map((x) =>
                            x.id === s.id && x.asset ? { ...x, asset: { ...x.asset, alt: e.target.value } } : x,
                          ),
                        })
                      }
                    />
                    <small>{s.asset.alt.length} characters · {s.asset.width} × {s.asset.height}</small>
                  </label>
                </>
              ) : (
                <p className="uc-muted">No image.</p>
              )}
              <ImageUpload
                label={s.asset ? "Replace with an upload" : "Add an image"}
                onUploaded={(asset) =>
                  setContent({
                    ...content,
                    pageSections: content.pageSections?.map((x) => (x.id === s.id ? { ...x, asset } : x)),
                  })
                }
              />
              {s.asset && s.id !== "hero" && (
                <button
                  type="button"
                  onClick={() =>
                    setContent({
                      ...content,
                      pageSections: content.pageSections?.map((x) => {
                        if (x.id !== s.id) return x;
                        const { asset: _removed, ...rest } = x;
                        return rest;
                      }),
                    })
                  }
                >
                  Remove image
                </button>
              )}
            </div>
          ))}
          <div className="uc-row-actions">
            {content.pageSections?.some((s) => s.asset) && (
              <button
                className="uc-primary"
                disabled={busy}
                onClick={async () => {
                  const ids = (content.pageSections ?? []).flatMap((s) => (s.asset ? [s.asset.id] : []));
                  for (const assetId of ids)
                    if (!(await action("/api/admin/publishing", { action: "asset-review", id: assetId, status: "accepted" }, `${ids.length} image(s) accepted`)))
                      return;
                }}
              >
                Accept these images
              </button>
            )}
            <button disabled={dirty || busy || !data.spec} onClick={() => start("image")}>
              Regenerate illustrations with AI
            </button>
          </div>
        </Panel>
      )}
      {tab === "assets" && version !== 3 && (
        <Panel title="Page images">
          <Empty title="Images are managed on regenerated (version three) pages" body="Regenerate this page to use the new image tools." />
        </Panel>
      )}
      {tab === "preview" && (
        <Panel title="Draft preview">
          <div className="uc-toolbar">
            <Tabs
              names={["desktop", "tablet", "mobile"]}
              active={viewport}
              change={setViewport}
            />
            <a href={"/admin/preview/" + id} target="_blank" rel="noreferrer">
              Open preview ↗
            </a>
          </div>
          <p>{version === 3 ? "Live preview: shows your unsaved edits as you type." : "Preview shows the saved draft; save edits to update it."}</p>
          <div
            className="uc-preview"
            style={{
              maxWidth:
                viewport === "mobile"
                  ? 390
                  : viewport === "tablet"
                    ? 768
                    : "100%",
            }}
          >
            {version === 3 ? (
              <iframe ref={previewFrame} title="Live page preview" src="/admin/preview/live" />
            ) : (
              <iframe title="Saved page preview" src={"/admin/preview/" + id} />
            )}
          </div>
        </Panel>
      )}
      {tab === "history" && (
        <Panel title="Revision history">
          {data.history.map((r: any) => (
            <div className="uc-history-row" key={r.id}>
              <div>
                <strong>{r.origin}</strong>
                <small>{date(r.created_at)}</small>
                <Badge
                  value={
                    r.id === p.published_revision_id
                      ? "Published"
                      : r.id === p.draft_revision_id
                        ? "Current draft"
                        : "Revision"
                  }
                />
              </div>
              <div className="uc-row-actions">
                <a
                  href={"/admin/preview/" + id + "?revision=" + r.id}
                  target="_blank"
                  rel="noreferrer"
                >
                  Preview
                </a>
                <button
                  onClick={async () => {
                    try {
                      setComparison(
                        (
                          await adminFetch(
                            "/api/admin/console/revisions?id=" + r.id,
                          )
                        ).content,
                      );
                      setCompareError("");
                    } catch (e) {
                      setCompareError(
                        e instanceof Error ? e.message : "Unable to compare",
                      );
                    }
                  }}
                >
                  Compare
                </button>
                <button
                  disabled={busy || dirty}
                  onClick={async () => {
                    if (
                      confirm(
                        "Restore this revision as the draft? The published page stays unchanged.",
                      )
                    ) {
                      if (
                        await action(
                          "/api/admin/console/pages",
                          { action: "restore", id, revisionId: r.id },
                          "Earlier draft restored",
                        )
                      )
                        refresh();
                    }
                  }}
                >
                  Restore draft
                </button>
                <button
                  disabled={busy || dirty}
                  onClick={async () => {
                    if (confirm("Publish this earlier revision?")) {
                      if (
                        await action(
                          "/api/admin",
                          { action: "rollback", id, revisionId: r.id },
                          "Earlier revision published",
                        )
                      )
                        refresh();
                    }
                  }}
                >
                  Publish earlier revision
                </button>
              </div>
            </div>
          ))}
          {compareError && <p role="alert">{compareError}</p>}
          {comparison && (
            <RevisionComparison previous={comparison} current={content} />
          )}
        </Panel>
      )}
      {validation.errors?.length > 0 && (
        <div className="uc-validation" role="alert">
          <strong>Draft checks</strong>
          {validation.errors.map((e: string) => (
            <p key={e}>{e}</p>
          ))}
        </div>
      )}
      {validation.warnings?.length > 0 && <div className="uc-validation"><strong>Suggestions — publication remains available</strong>{validation.warnings.map((warning: string) => <p key={warning}>{warning}</p>)}</div>}
      <div className="uc-editor-actions">
        <div>
          <strong>{dirty ? "Unsaved changes" : "Saved draft"}</strong>
          <small>
            {autosave.error
              ? "Autosave paused: " + autosave.error
              : dirty
                ? version === 3
                  ? "Autosaves every 10 seconds."
                  : "Publishing saves your changes first."
                : autosave.at
                  ? "Autosaved " + autosave.at.toLocaleTimeString()
                  : qa
                    ? `Quality score ${qa.score}/100`
                    : "Ready to publish"}
          </small>
        </div>
        <div className="uc-row-actions">
          {data.run?.status === "failed" && (
            <button
              disabled={busy || dirty}
              title="Retries failed tasks in the existing run. Completed copy and images are preserved."
              onClick={() =>
                action(
                  "/api/admin/publishing",
                  { action: "retry", id: data.run.id },
                  "Only failed tasks queued. Completed content and illustrations are preserved.",
                )
              }
            >
              Retry failed tasks only
            </button>
          )}
          <button
            disabled={dirty || busy || !data.spec}
            title={data.spec ? undefined : "Import a page specification before generating this page"}
            onClick={() => start("page")}
          >
            Regenerate page
          </button>
          <a
            className="uc-button"
            href={"/admin/preview/" + id}
            target="_blank"
            rel="noreferrer"
          >
            Preview
          </a>
          {p.published_revision_id && (
            <a
              className="uc-button"
              href={p.path}
              target="_blank"
              rel="noreferrer"
            >
              Visit live page ↗
            </a>
          )}
          <button disabled={busy || !dirty} onClick={save}>
            Save draft
          </button>
          {version === 3 && (
            <button
              disabled={dirty || busy}
              onClick={async () => {
                if (
                  await action(
                    "/api/admin/console/pages",
                    { action: "review", id, revisionId: baseRevision ?? p.draft_revision_id },
                    "Draft accepted; publish when ready",
                  )
                )
                  refresh();
              }}
            >
              Accept review
            </button>
          )}
          <button className="uc-primary" disabled={busy} onClick={publish}>
            {qa && qa.checks.some((c) => c.status === "fail") ? "Publish (checks failing)" : "Publish"}
          </button>
        </div>
      </div>
      {generation && (
        <Drawer
          title={"Regenerate " + generation}
          close={() => setGeneration(null)}
        >
          <GenerationForm
            settings={settings}
            illustrationCount={data.spec?.sections.filter((s: any) => s.hero).length}
            paths={[p.path]}
            scope={generation}
            sectionIds={selected}
            baseRevisionId={baseRevision ?? p.draft_revision_id}
            busy={busy}
            submit={async (input) => {
              if (
                await action(
                  "/api/admin/publishing",
                  { action: "queue", input },
                  "Generation queued; your current draft is preserved until completion",
                )
              ) {
                setGeneration(null);
                production.refresh();
              }
            }}
          />
        </Drawer>
      )}
    </div>
  );
}
function fieldLabel(key: string) {
  return key.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
function RevisionComparison({
  previous,
  current,
}: {
  previous: Content;
  current: Content;
}) {
  const fields = (content: Content) => {
    const result: Record<string, string> = {
      Title: content.title,
      Description: content.description,
      ...content.texts,
    };
    for (const section of content.pageSections ?? [])
      for (const [key, value] of Object.entries(section.fields))
        result[section.id + " / " + key] = value;
    if (content.sections)
      for (const section of content.sections)
        result[section.id] = JSON.stringify(section);
    return result;
  };
  const before = fields(previous),
    after = fields(current);
  const changed = [
    ...new Set([...Object.keys(before), ...Object.keys(after)]),
  ].filter((key) => before[key] !== after[key]);
  return (
    <section className="uc-comparison">
      <h3>Differences from current draft</h3>
      {changed.length ? (
        changed.map((key) => (
          <div key={key}>
            <h4>{fieldLabel(key)}</h4>
            <div className="uc-two-col">
              <p>
                <strong>Earlier revision</strong>
                <br />
                {before[key] || "Empty"}
              </p>
              <p>
                <strong>Current draft</strong>
                <br />
                {after[key] || "Empty"}
              </p>
            </div>
          </div>
        ))
      ) : (
        <p>No copy differences.</p>
      )}
    </section>
  );
}

function SeoPanel({
  content,
  path,
  change,
}: {
  content: Content;
  path: string;
  change: (content: Content) => void;
}) {
  const seo = content.seo ?? {
    metaTitle: content.title,
    metaDescription: content.description,
    primaryKeyword: "",
    secondaryKeywords: [],
    entities: [],
    searchIntent: "",
    buyerQuestions: [],
  };
  const set = (patch: Partial<typeof seo>) => {
    const next = { ...seo, ...patch };
    change({
      ...content,
      seo: next,
      title: (next.metaTitle || content.title).slice(0, 150),
      description: (next.metaDescription || content.description).slice(0, 320),
    });
  };
  const site = typeof location === "undefined" ? "" : location.host;
  const count = (value: string, min: number, max: number) => (
    <small className={value.length >= min && value.length <= max ? "uc-ok" : "uc-warn"}>
      {value.length} characters · aim for {min}–{max}
    </small>
  );
  const list = (value: string) => value.split(",").map((v) => v.trim()).filter(Boolean);
  return (
    <div className="uc-two-col">
      <Panel title="Search appearance">
        <label>
          Meta title
          <input value={seo.metaTitle} maxLength={80} onChange={(e) => set({ metaTitle: e.target.value })} />
          {count(seo.metaTitle, 30, 60)}
        </label>
        <label>
          Meta description
          <textarea rows={3} maxLength={200} value={seo.metaDescription} onChange={(e) => set({ metaDescription: e.target.value })} />
          {count(seo.metaDescription, 120, 160)}
        </label>
        <div className="uc-serp" aria-label="Search result preview">
          <span className="uc-serp-url">{site}{path === "/" ? "" : path.replaceAll("/", " › ")}</span>
          <span className="uc-serp-title">{seo.metaTitle.length > 60 ? seo.metaTitle.slice(0, 58) + "…" : seo.metaTitle || "Add a meta title"}</span>
          <span className="uc-serp-desc">{seo.metaDescription.length > 160 ? seo.metaDescription.slice(0, 157) + "…" : seo.metaDescription || "Add a meta description."}</span>
        </div>
      </Panel>
      <Panel title="Keyword strategy">
        <label>
          Primary keyword
          <input value={seo.primaryKeyword} onChange={(e) => set({ primaryKeyword: e.target.value })} />
        </label>
        <label>
          Secondary keywords <span className="uc-muted">(comma separated)</span>
          <textarea rows={2} value={seo.secondaryKeywords.join(", ")} onChange={(e) => set({ secondaryKeywords: list(e.target.value) })} />
        </label>
        <label>
          Entities <span className="uc-muted">(technologies, standards, concepts)</span>
          <textarea rows={2} value={seo.entities.join(", ")} onChange={(e) => set({ entities: list(e.target.value) })} />
        </label>
        {seo.buyerQuestions.length > 0 && (
          <details>
            <summary>Buyer questions from the brief ({seo.buyerQuestions.length})</summary>
            <ul>
              {seo.buyerQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          </details>
        )}
        <p className="uc-muted">Canonical URL: {path}. Search intent: {seo.searchIntent || "not set"}.</p>
      </Panel>
    </div>
  );
}

function ImageUpload({
  label,
  onUploaded,
}: {
  label: string;
  onUploaded: (asset: { id: string; hash: string; alt: string; width: number; height: number; mime: "image/webp" }) => void;
}) {
  const [alt, setAlt] = useState("");
  const [state, setState] = useState("");
  return (
    <details className="uc-upload">
      <summary>{label}</summary>
      <label>
        Alt text (required)
        <input value={alt} maxLength={300} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what the image shows" />
      </label>
      <label>
        Image file (PNG, JPEG or WebP, up to 8 MB)
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp"
          disabled={alt.trim().length < 10 || state === "Uploading…"}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setState("Uploading…");
            const form = new FormData();
            form.set("file", file);
            form.set("alt", alt);
            try {
              const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
              const result = await response.json();
              if (!response.ok) throw new Error(result.error ?? "Upload failed");
              onUploaded(result.asset);
              setState("Uploaded. Save the draft to keep it.");
              setAlt("");
            } catch (error) {
              setState(error instanceof Error ? error.message : "Upload failed");
            }
            e.target.value = "";
          }}
        />
      </label>
      {alt.trim().length < 10 && <small className="uc-muted">Write the alt text first (at least 10 characters).</small>}
      {state && <p role="status">{state}</p>}
    </details>
  );
}
