"use client";
import { useCallback, useEffect, useState } from "react";
import { adminFetch, Badge, Empty, Panel } from "../admin-console";
import { mediaPath } from "../media-path";

type Idea = { id: string; subject: string; title: string; angle: string; why: string; evidence_needed: string[]; services: string[]; industry: string; location: string };
type StudyRow = { id: string; slug: string; title: string; status: string; updated_at: string; headline: string | null; images: number; origin: string; progress: { step: string; error?: string } | null };
type Content = {
  headline: string; summary: string; client: { name: string; industry: string; location: string; size: string };
  services: string[]; timeline: string; challenge: string; approach: string; solution: string; results: string;
  outcomes: { metric: string; value: string; note: string }[]; testimonial: { quote: string; attribution: string };
  techStack: string[]; metaTitle: string; metaDescription: string; gaps: string[]; disclosure: string; primaryKeyword: string; secondaryKeywords: string[];
};
type Design = { accent: string; nav: string[]; styleGuide: string; dataset: string };
type Study = { id: string; slug: string; origin: string; title: string; subject: string; facts: string; status: string; content: Partial<Content>; design?: Partial<Design> };
type Img = { id: string; style: "ui" | "illustration"; slot: string; purpose: string; prompt: string; alt: string; ratio: string; asset_id: string | null; error: string | null; width?: number; height?: number };

const post = (body: unknown) => adminFetch("/api/admin/case-studies", body);

/** Toggle chips for picking several options; nothing selected means "let the AI choose". */
function Chips({ label, options, value, onChange, hint, groups }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; hint: string; groups?: { group: string; items: string[] }[] }) {
  const chip = (o: string) => (
    <button key={o} type="button" aria-pressed={value.includes(o)} className={"cs-chip" + (value.includes(o) ? " on" : "")}
      onClick={() => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])}>{o}</button>
  );
  return (
    <fieldset className="cs-chips">
      <legend>{label} <span className="uc-muted">{value.length ? `${value.length} selected` : hint}</span></legend>
      {groups ? groups.map((g) => (
        <div key={g.group} className="cs-chip-group"><span className="cs-chip-label">{g.group}</span><div>{g.items.map(chip)}</div></div>
      )) : <div>{options.map(chip)}</div>}
    </fieldset>
  );
}
const ratios = ["16:9", "4:3", "3:2", "1:1"];
const textFields: { key: "headline" | "summary" | "challenge" | "approach" | "solution" | "results" | "metaTitle" | "metaDescription"; label: string; rows: number }[] = [
  { key: "headline", label: "Headline", rows: 2 },
  { key: "summary", label: "Summary", rows: 3 },
  { key: "challenge", label: "Challenge", rows: 6 },
  { key: "approach", label: "Approach", rows: 7 },
  { key: "solution", label: "Solution", rows: 7 },
  { key: "results", label: "Results", rows: 6 },
  { key: "metaTitle", label: "SEO title", rows: 1 },
  { key: "metaDescription", label: "SEO description", rows: 2 },
];

/** Case study workspace: brainstorm ideas, write from real facts, plan and generate images. */
export function CaseStudies() {
  const [openId, setOpenId] = useState<string | null>(null);
  useEffect(() => {
    const read = () => setOpenId(new URLSearchParams(location.search).get("study"));
    read();
    addEventListener("popstate", read);
    return () => removeEventListener("popstate", read);
  }, []);
  const open = (id: string | null) => {
    history.pushState(null, "", id ? "?study=" + id : location.pathname);
    setOpenId(id);
  };
  return openId ? <Editor id={openId} back={() => open(null)} /> : <Home open={open} />;
}

function useNotice() {
  const [msg, setMsg] = useState<{ text: string; error?: boolean } | null>(null);
  const [busy, setBusy] = useState("");
  async function run<T>(key: string, work: () => Promise<T>, done?: string): Promise<T | undefined> {
    setBusy(key);
    setMsg(null);
    try {
      const result = await work();
      if (done) setMsg({ text: done });
      return result;
    } catch (e) {
      setMsg({ text: e instanceof Error ? e.message : "Something went wrong", error: true });
    } finally {
      setBusy("");
    }
  }
  const notice = msg && (
    <p className="uc-notice" role={msg.error ? "alert" : "status"} style={msg.error ? { borderLeftColor: "var(--uc-red)" } : undefined}>
      {msg.text}
      <button aria-label="Dismiss" onClick={() => setMsg(null)}>×</button>
    </p>
  );
  return { run, busy, notice };
}

function Home({ open }: { open: (id: string) => void }) {
  const [data, setData] = useState<{ ideas: Idea[]; studies: StudyRow[]; options: { services: string[]; serviceGroups: { group: string; items: string[] }[]; industries: string[]; locations: string[] } } | null>(null);
  const [services, setServices] = useState<string[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [count, setCount] = useState(8);
  const [autoCount, setAutoCount] = useState(1);
  const { run, busy, notice } = useNotice();
  const load = useCallback(() => adminFetch("/api/admin/case-studies").then(setData).catch(() => setData({ ideas: [], studies: [], options: { services: [], serviceGroups: [], industries: [], locations: [] } })), []);
  useEffect(() => { load(); }, [load]);
  const working = !!data?.studies.some((s) => s.progress && !["Done", "Failed"].includes(s.progress.step));
  useEffect(() => {
    if (!working) return;
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [working, load]);

  async function start(idea: Idea) {
    const r = await run("start-" + idea.id, () => post({ action: "create", title: idea.title, subject: idea.subject, ideaId: idea.id, facts: "", services: idea.services, industry: idea.industry, location: idea.location }));
    if (r) open(r.study.id);
  }
  async function blank() {
    const title = prompt("Working title for the case study");
    if (!title?.trim()) return;
    const r = await run("blank", () => post({ action: "create", title: title.trim(), subject: subject.trim() || title.trim() }));
    if (r) open(r.study.id);
  }

  return (
    <>
      {notice}
      <Panel title="Focus">
        <p className="uc-muted">Choose the services to combine (each study is linked to those service pages and listed on them), the industries to cover and where the clients are based. Each study mixes one to three of the selected services for one selected industry. Leave a group empty to let the AI pick from all of them.</p>
        {data && <>
          <Chips label="Services" hint="any service" options={data.options.services} groups={data.options.serviceGroups} value={services} onChange={setServices} />
          <Chips label="Industries" hint="any industry" options={data.options.industries} value={industries} onChange={setIndustries} />
          <Chips label="Client locations" hint="anywhere" options={data.options.locations} value={locations} onChange={setLocations} />
        </>}
      </Panel>

      <Panel title="Auto-build">
        <p className="uc-muted">One click: brainstorm, invent the success story of a person or business, in the locations you picked, who had an app built (no names anywhere, including in screenshots), write the draft, plan realistic dashboard images and generate them. The study is marked as an illustrative scenario with sample data. Replace it with real facts before presenting it as a client result.</p>
        <div className="uc-row-actions">
          <label className="cs-inline">Studies<select value={autoCount} onChange={(e) => setAutoCount(Number(e.target.value))}>{[1, 2, 3, 5].map((n) => <option key={n}>{n}</option>)}</select></label>
          <button className="uc-button uc-primary" disabled={!!busy || working} onClick={async () => { if (await run("auto", () => post({ action: "auto", subject, notes, services, industries, locations, count: autoCount }), "Building in the background. Progress shows in the list below.")) load(); }}>
            {busy === "auto" ? "Starting…" : working ? "Building…" : "Auto-build case studies"}
          </button>
        </div>
        <small className="uc-muted">Uses the subject and notes from the form below. Keep this page's server running until it finishes.</small>
      </Panel>

      <Panel title="Brainstorm ideas">
        <p className="uc-muted">Describe a service, industry or type of project. The AI proposes case study angles and lists the real evidence each would need. It does not invent clients or results.</p>
        <div className="cs-form">
          <label>Extra direction <span className="uc-muted">(optional, added to the focus above)</span><input value={subject} maxLength={300} placeholder="e.g. an owner moving from spreadsheets to one system" onChange={(e) => setSubject(e.target.value)} /></label>
          <label>What you already have <span className="uc-muted">(optional: clients, projects, results you can share)</span>
            <textarea rows={3} value={notes} maxLength={3000} onChange={(e) => setNotes(e.target.value)} />
          </label>
          <div className="uc-row-actions">
            <label className="cs-inline">Ideas<select value={count} onChange={(e) => setCount(Number(e.target.value))}>{[4, 6, 8, 10, 12].map((n) => <option key={n}>{n}</option>)}</select></label>
            <button className="uc-button uc-primary" disabled={!!busy} onClick={async () => { if (await run("brainstorm", () => post({ action: "brainstorm", subject, notes, services, industries, locations, count }), "Ideas added below")) load(); }}>
              {busy === "brainstorm" ? "Thinking…" : "Brainstorm ideas"}
            </button>
            <button className="uc-button" disabled={!!busy} onClick={blank}>Start from scratch</button>
          </div>
        </div>
      </Panel>

      <Panel title={`Ideas${data?.ideas.length ? ` (${data.ideas.length})` : ""}`}>
        {!data ? <p className="uc-muted">Loading…</p> : !data.ideas.length ? <Empty title="No ideas yet" body="Brainstorm above to fill this list." /> : (
          <div className="cs-cards">
            {data.ideas.map((i) => (
              <article key={i.id} className="cs-card">
                <h3>{i.title}</h3>
                {(i.services?.length > 0 || i.industry || i.location) && <p className="cs-tags">{i.services?.map((s) => <span key={s} className="cs-tag">{s}</span>)}{i.industry && <span className="cs-tag ind">{i.industry}</span>}{i.location && <span className="cs-tag ind">{i.location}</span>}</p>}
                <p>{i.angle}</p>
                {i.why && <p className="uc-muted">{i.why}</p>}
                {i.evidence_needed.length > 0 && <><strong className="cs-small">Evidence needed</strong><ul>{i.evidence_needed.map((e, n) => <li key={n}>{e}</li>)}</ul></>}
                <div className="uc-row-actions">
                  <button className="uc-button uc-primary" disabled={!!busy} onClick={() => start(i)}>{busy === "start-" + i.id ? "Creating…" : "Start case study"}</button>
                  <button className="uc-button" disabled={!!busy} onClick={async () => { await run("x" + i.id, () => post({ action: "dismiss-idea", id: i.id })); load(); }}>Dismiss</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Case studies">
        {!data ? null : !data.studies.length ? <Empty title="No case studies yet" body="Start one from an idea." /> : (
          <table className="uc-table"><thead><tr><th>Title</th><th>Status</th><th>Images</th><th>Updated</th><th /></tr></thead>
            <tbody>{data.studies.map((s) => (
              <tr key={s.id}>
                <td><strong>{s.title}</strong>{s.headline && <div className="uc-muted">{s.headline}</div>}{s.progress && s.progress.step !== "Done" && <div className="uc-muted">{s.progress.step === "Failed" ? "Failed: " + (s.progress.error ?? "") : s.progress.step + "…"}</div>}{s.origin === "auto" && <span className="uc-loz uc-loz-review">Illustrative</span>}</td>
                <td><Badge value={s.status} /></td>
                <td>{s.images}</td>
                <td>{new Date(s.updated_at).toLocaleDateString("en-IN")}</td>
                <td><div className="uc-row-actions"><button className="uc-button" onClick={() => open(s.id)}>Open</button><a className="uc-button" href={"/case-studies/" + s.slug} target="_blank" rel="noreferrer">{s.status === "published" ? "View on site ↗" : "Preview ↗"}</a></div></td>
              </tr>))}</tbody></table>
        )}
      </Panel>
    </>
  );
}

function Editor({ id, back }: { id: string; back: () => void }) {
  const [study, setStudy] = useState<Study | null>(null);
  const [images, setImages] = useState<Img[]>([]);
  const [dirty, setDirty] = useState(false);
  const { run, busy, notice } = useNotice();
  const load = useCallback(async () => {
    const r = await adminFetch("/api/admin/case-studies?id=" + id);
    setStudy(r.study);
    setImages(r.images);
    setDirty(false);
  }, [id]);
  useEffect(() => { load().catch(() => setStudy(null)); }, [load]);
  if (!study) return <p className="uc-muted">Loading…</p>;
  const content = study.content as Partial<Content>;
  const set = (patch: Partial<Study>) => { setStudy({ ...study, ...patch }); setDirty(true); };
  const setContent = (patch: Partial<Content>) => set({ content: { ...content, ...patch } });
  const save = (status?: string) => run("save", async () => {
    const r = await post({ action: "save", id, input: { title: study.title, facts: study.facts, content: study.content, status: status ?? study.status } });
    setStudy(r.study);
    setDirty(false);
  }, "Saved");

  async function draft() {
    if (dirty && !(await save())) return;
    if (content.headline && !confirm("This replaces the current draft text. Continue?")) return;
    const r = await run("draft", () => post({ action: "draft", id }), "Draft written. Review every claim against your facts.");
    if (r) { setStudy(r.study); setDirty(false); }
  }
  async function rewrite(field: string) {
    const instruction = prompt("How should it change? (leave blank for a clearer, more specific version)") ?? null;
    if (instruction === null) return;
    if (dirty && !(await save())) return;
    const r = await run("rw-" + field, () => post({ action: "rewrite", id, field, instruction }));
    if (r) { setStudy(r.study); setDirty(false); }
  }

  return (
    <>
      {notice}
      <div className="uc-row-actions cs-bar">
        <button className="uc-button" onClick={() => (!dirty || confirm("Discard unsaved changes?")) && back()}>← All case studies</button>
        <Badge value={study.status} />
        <span style={{ flex: 1 }} />
        <button className="uc-button" disabled={!!busy || !dirty} onClick={() => save()}>{busy === "save" ? "Saving…" : dirty ? "Save changes" : "Saved"}</button>
        <a className="uc-button" href={"/case-studies/" + study.slug} target="_blank" rel="noreferrer" title={study.status === "published" ? "Open the live page" : "Preview the page (only you can see it until it is published)"}>
          {study.status === "published" ? "View on site ↗" : "Preview on site ↗"}
        </a>
        {study.status === "draft" && <button className="uc-button" disabled={!!busy} onClick={() => save("ready")}>Mark ready</button>}
        {study.status === "ready" && <button className="uc-button" disabled={!!busy} onClick={() => save("draft")}>Back to draft</button>}
        {study.status !== "published"
          ? <button className="uc-button uc-primary" disabled={!!busy} onClick={() => confirm("Publish this case study at /case-studies/" + study.slug + "? It becomes visible to everyone and appears in the sitemap.") && save("published")}>Publish to site</button>
          : <button className="uc-button" disabled={!!busy} onClick={() => confirm("Unpublish? The page will return a 404 for visitors.") && save("draft")}>Unpublish</button>}
        <button className="uc-button" disabled={!!busy} onClick={async () => { if (confirm("Delete this case study and its image slots?") && await run("del", () => post({ action: "delete", id }))) back(); }}>Delete</button>
      </div>

      <Panel title="Facts">
        <label className="cs-form">Working title<input value={study.title} maxLength={200} onChange={(e) => set({ title: e.target.value })} /></label>
        <label className="cs-form">Real project facts
          <textarea rows={10} value={study.facts} maxLength={20000} onChange={(e) => set({ facts: e.target.value })}
            placeholder={"Client or how to describe them, the problem, what you built, tools used, timeline, measured results with numbers and dates, any quote you have permission to use."} />
          <small className="uc-muted">The draft uses only what is written here. Anything missing is listed under “Still needed” instead of being invented.</small>
        </label>
        <div className="uc-row-actions">
          <button className="uc-button uc-primary" disabled={!!busy || study.facts.trim().length < 80} onClick={draft}>{busy === "draft" ? "Writing…" : content.headline ? "Rewrite whole draft with AI" : "Write draft with AI"}</button>
        </div>
      </Panel>

      {content.gaps && content.gaps.length > 0 && (
        <Panel title="Still needed">
          <ul className="cs-gaps">{content.gaps.map((g, n) => <li key={n}>{g}</li>)}</ul>
        </Panel>
      )}

      <Panel title="Draft">
        {!content.headline && !content.challenge ? <Empty title="Nothing drafted yet" body="Add facts above, then write a draft." /> : (
          <div className="cs-form">
            {textFields.map((f) => (
              <label key={f.key}>
                <span className="cs-label">{f.label}
                  {["headline", "summary", "challenge", "approach", "solution", "results"].includes(f.key) && (
                    <button type="button" className="uc-text-button" disabled={!!busy} onClick={() => rewrite(f.key)}>{busy === "rw-" + f.key ? "Rewriting…" : "Rewrite with AI"}</button>
                  )}
                </span>
                <textarea rows={f.rows} value={(content[f.key] as string) ?? ""} onChange={(e) => setContent({ [f.key]: e.target.value })} />
              </label>
            ))}
            <fieldset className="uc-field-group"><legend>Search keywords</legend>
              <div className="cs-pair" style={{ gridTemplateColumns: "1fr 1fr" }}>
                <label>Primary keyword<input value={content.primaryKeyword ?? ""} onChange={(e) => setContent({ primaryKeyword: e.target.value })} placeholder="e.g. custom software development for logistics" /></label>
                <label>Secondary keywords <span className="uc-muted">(comma separated)</span><input value={(content.secondaryKeywords ?? []).join(", ")} onChange={(e) => setContent({ secondaryKeywords: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
              </div>
              {(() => {
                const key = (content.primaryKeyword ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
                const has = (t?: string) => !!key && (t ?? "").toLowerCase().replace(/[^a-z0-9]+/g, " ").includes(key);
                const t = content.metaTitle ?? "", d = content.metaDescription ?? "";
                return <small className="uc-muted">
                  SEO title {t.length}/60, {has(t) ? "contains" : "missing"} the keyword. Description {d.length}/155, {has(d) ? "contains" : "missing"} the keyword. Missing keywords are fixed automatically when you publish.
                </small>;
              })()}
              <div className="uc-row-actions">
                <button type="button" className="uc-button" disabled={!!busy || dirty} title={dirty ? "Save your edits first" : undefined} onClick={async () => { const r = await run("seo", () => post({ action: "seo", id }), "Keywords, SEO title and description updated"); if (r) { setStudy(r.study); setDirty(false); } }}>{busy === "seo" ? "Writing…" : "Regenerate keywords and meta with AI"}</button>
              </div>
            </fieldset>
            <label>Disclosure <span className="uc-muted">(shown with the study; required for illustrative scenarios)</span>
              <textarea rows={2} value={content.disclosure ?? ""} onChange={(e) => setContent({ disclosure: e.target.value })} />
            </label>
            <label>Services <span className="uc-muted">(comma separated)</span>
              <input value={(content.services ?? []).join(", ")} onChange={(e) => setContent({ services: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </label>
            <label><span className="cs-label">Tech stack <span className="uc-muted">(comma separated)</span>
              <button type="button" className="uc-text-button" disabled={!!busy || dirty} title={dirty ? "Save your edits first" : undefined} onClick={async () => { const r = await run("stack", () => post({ action: "fill-stack", id }), "Tech stack filled from the facts and draft"); if (r) { setStudy(r.study); setDirty(false); } }}>{busy === "stack" ? "Reading…" : "Fill from facts with AI"}</button></span>
              <input value={(content.techStack ?? []).join(", ")} onChange={(e) => setContent({ techStack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean) })} />
            </label>
            {(content.outcomes ?? []).length > 0 && (
              <fieldset className="uc-field-group"><legend>Outcomes (from your facts)</legend>
                {content.outcomes!.map((o, n) => (
                  <div key={n} className="cs-outcome">
                    <input aria-label="Metric" value={o.metric} onChange={(e) => setContent({ outcomes: content.outcomes!.map((x, i) => (i === n ? { ...x, metric: e.target.value } : x)) })} />
                    <input aria-label="Value" value={o.value} onChange={(e) => setContent({ outcomes: content.outcomes!.map((x, i) => (i === n ? { ...x, value: e.target.value } : x)) })} />
                    <button type="button" className="uc-text-button" onClick={() => setContent({ outcomes: content.outcomes!.filter((_, i) => i !== n) })}>Remove</button>
                  </div>
                ))}
              </fieldset>
            )}
          </div>
        )}
      </Panel>

      <LookPanel studyId={id} initial={study.design} run={run} busy={busy} />
      <ImagesPanel studyId={id} images={images} setImages={setImages} run={run} busy={busy} reload={load} />
    </>
  );
}

/** The shared product look every realistic screen of this study is generated with. */
function LookPanel({ studyId, initial, run, busy }: { studyId: string; initial?: Partial<Design>; run: <T>(key: string, work: () => Promise<T>, done?: string) => Promise<T | undefined>; busy: string }) {
  const [look, setLook] = useState<Design>({ accent: "#4353b3", nav: [], styleGuide: "", dataset: "", ...initial });
  useEffect(() => { setLook((l) => ({ accent: "#4353b3", nav: [], styleGuide: "", dataset: "", ...initial, ...(initial ? {} : l) })); }, [initial]);
  const has = !!look.styleGuide;
  return (
    <Panel title="Product look (shared by every screen)">
      <p className="uc-muted">Every realistic screen in this study is generated with this palette, sidebar, top bar and sample data, so they read as one product. It is created automatically the first time you generate a screen. Edit it here, then generate the screens again.</p>
      {has && (
        <div className="cs-form">
          <div className="cs-pair">
            <label>Accent colour<input type="color" value={look.accent} onChange={(e) => setLook({ ...look, accent: e.target.value })} /></label>
            <label>Sidebar items <span className="uc-muted">(comma separated, in order)</span><input value={look.nav.join(", ")} onChange={(e) => setLook({ ...look, nav: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></label>
          </div>
          <label>Look and layout<textarea rows={5} value={look.styleGuide} onChange={(e) => setLook({ ...look, styleGuide: e.target.value })} /></label>
          <label>Sample data reused on every screen<textarea rows={5} value={look.dataset} onChange={(e) => setLook({ ...look, dataset: e.target.value })} /></label>
        </div>
      )}
      <div className="uc-row-actions">
        {has && <button className="uc-button" disabled={!!busy} onClick={() => run("sd", () => post({ action: "save-design", id: studyId, input: look }), "Look saved. Generate the screens again to apply it.")}>Save look</button>}
        <button className="uc-button uc-primary" disabled={!!busy} onClick={async () => { const r = await run("design", () => post({ action: "design", id: studyId }), "New look created. Generate the screens again to apply it."); if (r) setLook(r.design); }}>
          {busy === "design" ? "Designing…" : has ? "Regenerate look with AI" : "Create look with AI"}
        </button>
      </div>
    </Panel>
  );
}

function ImagesPanel({ studyId, images, setImages, run, busy, reload }: {
  studyId: string; images: Img[]; setImages: (v: Img[]) => void;
  run: <T>(key: string, work: () => Promise<T>, done?: string) => Promise<T | undefined>; busy: string; reload: () => Promise<void>;
}) {
  const edit = (id: string, patch: Partial<Img>) => setImages(images.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const persist = (i: Img) => post({ action: "save-image", id: i.id, input: { prompt: i.prompt, alt: i.alt, ratio: i.ratio, slot: i.slot, style: i.style } });

  async function generate(i: Img) {
    const r = await run("gen-" + i.id, async () => { await persist(i); return post({ action: "generate-image", id: i.id }); }, "Image generated");
    if (!r) await reload().catch(() => {});
    else edit(i.id, r.image);
  }
  async function upload(i: Img, file: File) {
    await run("up-" + i.id, async () => {
      const form = new FormData();
      form.set("file", file);
      form.set("alt", i.alt || i.prompt.slice(0, 120));
      const res = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? "Upload failed");
      const r = await post({ action: "attach-image", id: i.id, assetId: body.asset.id });
      edit(i.id, r.image);
    }, "Image uploaded");
  }

  return (
    <Panel title="Images">
      <p className="uc-muted">The AI proposes a prompt for each image, mostly realistic product screens with sample data. Edit the prompt, then generate. Generated screens are mockups, so do not present them as screenshots of a real client system.</p>
      <div className="uc-row-actions">
        <button className="uc-button uc-primary" disabled={!!busy} onClick={async () => { const r = await run("plan", () => post({ action: "plan-images", id: studyId, replace: true }), "Image prompts proposed"); if (r) await reload(); }}>
          {busy === "plan" ? "Planning…" : images.length ? "Re-plan unused prompts with AI" : "Suggest images with AI"}
        </button>
        {images.some((i) => i.style === "ui") && (
          <button className="uc-button" disabled={!!busy} onClick={async () => {
            if (!confirm("Generate every realistic UI screen again with the shared product look? This uses one image credit per screen.")) return;
            for (const i of images.filter((x) => x.style === "ui")) {
              const r = await run("gen-" + i.id, async () => { await persist(i); return post({ action: "generate-image", id: i.id }); });
              if (!r) break;
              edit(i.id, r.image);
            }
          }}>Regenerate all UI screens</button>
        )}
        <button className="uc-button" disabled={!!busy} onClick={async () => { const p = prompt("Describe the image you want"); if (p && p.trim().length >= 20) { await run("add", () => post({ action: "add-image", id: studyId, input: { prompt: p.trim() } })); await reload(); } else if (p) alert("Use at least 20 characters."); }}>Add my own prompt</button>
      </div>
      {!images.length ? <Empty title="No images planned" body="Suggest images once the draft exists." /> : (
        <div className="cs-images">
          {images.map((i) => (
            <article key={i.id} className="cs-image">
              <div className={"cs-preview r" + i.ratio.replace(":", "x")}>
                {i.asset_id ? <img src={mediaPath({ id: i.asset_id })} alt={i.alt} /> : <span className="uc-muted">{busy === "gen-" + i.id ? "Generating, this can take a minute or two…" : "Not generated yet"}</span>}
              </div>
              <div className="cs-form">
                <div className="cs-pair">
                  <label>Slot<input value={i.slot} maxLength={40} onChange={(e) => edit(i.id, { slot: e.target.value })} /></label>
                  <label>Style<select value={i.style} onChange={(e) => edit(i.id, { style: e.target.value as Img["style"] })}><option value="ui">Realistic UI</option><option value="illustration">Flat illustration</option></select></label>
                  <label>Ratio<select value={i.ratio} onChange={(e) => edit(i.id, { ratio: e.target.value })}>{ratios.map((r) => <option key={r}>{r}</option>)}</select></label>
                </div>
                {i.purpose && <small className="uc-muted">{i.purpose}</small>}
                <label>Image prompt<textarea rows={6} value={i.prompt} onChange={(e) => edit(i.id, { prompt: e.target.value })} /></label>
                <label>Alt text<input value={i.alt} maxLength={300} onChange={(e) => edit(i.id, { alt: e.target.value })} /><small>{i.alt.length}/125 recommended</small></label>
                {i.error && <p role="alert" style={{ color: "var(--uc-red)" }}>{i.error}</p>}
                <div className="uc-row-actions">
                  <button className="uc-button uc-primary" disabled={!!busy || i.prompt.trim().length < 20} onClick={() => generate(i)}>{busy === "gen-" + i.id ? "Generating…" : i.asset_id ? "Generate again" : "Generate image"}</button>
                  <button className="uc-button" disabled={!!busy} onClick={() => run("sv-" + i.id, () => persist(i), "Prompt saved")}>Save prompt</button>
                  <label className="uc-button cs-upload">Upload instead<input type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(i, f); e.target.value = ""; }} /></label>
                  <button className="uc-text-button" disabled={!!busy} onClick={async () => { if (confirm("Remove this image slot?")) { await run("rm", () => post({ action: "delete-image", id: i.id })); await reload(); } }}>Remove</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
