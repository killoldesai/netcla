"use client";
// Animated project board for v2 service pages (the homepage hero board, driven by the page's own content).
// Rows are the page's deliverables and the weekly update lists its process steps. Statuses move along on a timer
// like a live board. Decorative only (aria-hidden); honours prefers-reduced-motion.
import { useEffect, useState } from "react";
import { V2Icon, v2img } from "./ui";

type Status = "work" | "review" | "done" | "none";
const LABEL: Record<Status, string> = { work: "Working on it", review: "In review", done: "Done", none: "Up next" };
const OWNERS = ["fullstack", "cloud", "design", "devops", "react", "node", "qa", "ai"];
const SPOTS: [number, number][] = [[0, 0], [-160, -120], [70, -180], [-70, 70], [120, 30]];
const START: Status[] = ["work", "review", "work", "none", "none", "none", "none", "none"];
const NEXT: Record<Status, Status> = { none: "work", work: "review", review: "done", done: "done" };
const PCT: Record<Status, number> = { none: 6, work: 48, review: 86, done: 100 };

export function ServiceBoard({ title, rows, steps, role = "Full stack developer" }: { title: string; rows: string[]; steps: string[]; role?: string }) {
  const tasks = rows.slice(0, 6);
  const [reduce, setReduce] = useState(false);
  const [status, setStatus] = useState<Status[]>(tasks.map((_, i) => START[i] ?? "none"));
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const r = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduce(r);
    const t = window.setTimeout(() => setReady(true), 120);
    return () => window.clearTimeout(t);
  }, []);

  // The board moves along: one task advances a stage every few seconds; when all are done it starts over.
  useEffect(() => {
    if (reduce || !tasks.length) return;
    const t = window.setInterval(() => {
      setStatus((prev) => {
        if (prev.every((s) => s === "done")) return tasks.map((_, i) => START[i] ?? "none");
        const i = prev.findIndex((s) => s === "review") >= 0 ? prev.findIndex((s) => s === "review") : prev.findIndex((s) => s !== "done");
        const next = [...prev];
        next[i] = NEXT[prev[i]];
        const waiting = next.findIndex((s) => s === "none");
        if (next[i] === "done" && waiting >= 0) next[waiting] = "work";
        return next;
      });
    }, 2600);
    return () => window.clearInterval(t);
  }, [reduce, tasks.length]);

  // Weekly update checklist and cursor
  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => setTick((n) => n + 1), 1500);
    return () => window.clearInterval(t);
  }, [reduce]);

  // Role card types what is being worked on now
  const current = tasks[status.findIndex((s) => s === "work")] ?? tasks[0] ?? "";
  useEffect(() => {
    const text = current ? `Building ${current.charAt(0).toLowerCase()}${current.slice(1)}` : "";
    if (reduce) { setTyped(text); return; }
    let i = 0;
    setTyped("");
    const t = window.setInterval(() => { i += 1; setTyped(text.slice(0, i)); if (i >= text.length) window.clearInterval(t); }, 34);
    return () => window.clearInterval(t);
  }, [current, reduce]);

  const items = steps.slice(0, 4);
  const step = reduce ? items.length : tick % (items.length + 1);
  const [cx, cy] = reduce ? [0, 0] : SPOTS[step % SPOTS.length];
  const open = tasks.map((t, i) => [t, i] as const).filter(([, i]) => status[i] !== "done");
  const done = tasks.map((t, i) => [t, i] as const).filter(([, i]) => status[i] === "done");

  const row = (task: string, i: number) => {
    const s = status[i];
    return (
      <div key={task} className="tr">
        <span>{task}</span>
        <span className="who"><img src={v2img(`char-${OWNERS[i % OWNERS.length]}`)} alt="" /></span>
        <span className={`st st--${s}`}>{LABEL[s]}</span>
        <span><i className="bar"><b style={{ width: ready || reduce ? `${PCT[s]}%` : "0%", background: s === "done" ? "var(--s-done)" : undefined }} /></i></span>
      </div>
    );
  };

  return (
    <div className="hstage sb-stage" aria-hidden="true">
      <div className="hstage__in">
        <div className="rolecard">
          <img src={v2img(`char-${OWNERS[Math.max(0, status.findIndex((s) => s === "work")) % OWNERS.length]}`)} alt="" />
          <span>
            <b>{role}</b>
            <span className="typing">{typed}</span>
          </span>
        </div>
        <div className="hboard">
          <div className="hboard__rail"><i /><i /><i /><i /><i /><i /></div>
          <div className="hboard__main">
            <div className="hboard__title">{title}</div>
            <div className="hboard__tabs"><span className="on">Main table</span><span>Timeline</span><span>Kanban</span><span>+</span></div>
            <div className="grp-t">This sprint</div>
            <div className="tbl">
              <div className="tr tr--h"><span>Deliverable</span><span>Owner</span><span>Status</span><span>Progress</span></div>
              {open.map(([t, i]) => row(t, i))}
            </div>
            {done.length > 0 && (
              <>
                <div className="grp-t grp-t--b">Released</div>
                <div className="tbl tbl--b">{done.map(([t, i]) => row(t, i))}</div>
              </>
            )}
          </div>
        </div>
        {items.length > 0 && (
          <div className="upd">
            <div className="upd__h">
              <img src={v2img("char-lead")} alt="" />
              <span><b>Project stages</b><span>Shared with your team</span></span>
            </div>
            <p className="upd__label"><i />Moving through the plan</p>
            <ul>
              {items.map((item, i) => (
                <li key={item} className={i < step ? "on" : undefined}>
                  <i><V2Icon name="check" /></i>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}
        <svg className="cursor" style={{ transform: `translate(${cx}px, ${cy}px)` }}><use href="#i-cursor" /></svg>
      </div>
    </div>
  );
}
