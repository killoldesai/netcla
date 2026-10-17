"use client";
// Homepage hero: copy, the "What do you need built?" chips and the animated project board.
// Ported from html-prototype/v2/js/home.js (boards, typing, row bars, weekly update loop and cursor).
// Honours prefers-reduced-motion: the text is shown in full, bars are filled and nothing moves.
import { useEffect, useState, type ReactNode } from "react";
import { V2Icon, v2img } from "../../site/v2/ui";
import { Section, selectService, useTrack } from "../ui";

type Status = "work" | "review" | "none";
type Row = [task: string, owner: string, status: Status, label: string, percent: number];
type Done = [task: string, owner: string];
type Board = {
  title: string;
  role: string;
  ava: string;
  doing: string;
  rows: Row[];
  done: Done[];
};

// One board per chip. Owners are the generated role characters (char-<owner>.webp).
const boards: Record<string, Board> = {
  software: {
    title: "Customer portal", role: "Full stack developer", ava: "fullstack", doing: "Building the orders API",
    rows: [["Orders API", "cloud", "work", "Working on it", 62], ["CRM sync", "fullstack", "work", "Working on it", 40], ["Admin roles", "design", "review", "In review", 85], ["Billing export", "cloud", "none", "Up next", 8]],
    done: [["Login flow", "fullstack"], ["Invoices", "cloud"]],
  },
  ai: {
    title: "Support assistant", role: "AI/ML developer", ava: "ai", doing: "Connecting your documents",
    rows: [["Document search", "ai", "work", "Working on it", 70], ["Draft replies", "ai", "work", "Working on it", 48], ["Human review step", "design", "review", "In review", 88], ["Form data extraction", "fullstack", "none", "Up next", 5]],
    done: [["Data check", "ai"], ["Use case agreed", "design"]],
  },
  cloud: {
    title: "Cloud migration", role: "DevOps engineer", ava: "devops", doing: "Writing Terraform modules",
    rows: [["Terraform modules", "devops", "work", "Working on it", 58], ["Monitoring", "devops", "work", "Working on it", 35], ["Staging environment", "cloud", "review", "In review", 90], ["Production cutover", "cloud", "none", "Up next", 4]],
    done: [["CI/CD pipeline", "devops"], ["Containers", "cloud"]],
  },
  mobile: {
    title: "Booking app", role: "Mobile developer", ava: "mobile", doing: "Building push notifications",
    rows: [["Push notifications", "mobile", "work", "Working on it", 55], ["Payments screen", "design", "work", "Working on it", 38], ["Android build", "mobile", "review", "In review", 86], ["Store release", "mobile", "none", "Up next", 6]],
    done: [["iOS build", "mobile"], ["App designs", "design"]],
  },
  scope: {
    title: "Discovery", role: "Project lead", ava: "lead", doing: "Reading your brief",
    rows: [["Users and goals", "design", "work", "Working on it", 60], ["Existing systems", "cloud", "work", "Working on it", 42], ["Constraints", "design", "review", "In review", 80], ["Initial estimate", "fullstack", "none", "Up next", 6]],
    done: [["Brief received", "lead"], ["Call arranged", "lead"]],
  },
};

// Cursor positions for each step of the weekly update loop (px).
const spots: [number, number][] = [[0, 0], [-150, -110], [80, -170], [-60, 80], [120, 40]];
const updateItems = ["Staging build deployed", "Test results attached", "Progress review booked", "Ready for your sign off"];

export type BriefOption = { key: string; label: ReactNode; service: string };

export function HeroBoard({
  intro,
  options,
  briefTitle,
  briefSub,
  goLabel,
  note,
  secondary,
}: {
  intro: ReactNode;
  options: BriefOption[];
  briefTitle: ReactNode;
  briefSub: ReactNode;
  goLabel: ReactNode;
  note: ReactNode;
  secondary: ReactNode;
}) {
  const track = useTrack();
  const [key, setKey] = useState(options[0]?.key ?? "software");
  const [reduce, setReduce] = useState(false);
  const [typed, setTyped] = useState(boards[key].doing);
  const [ready, setReady] = useState(false);
  const [bumped, setBumped] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setReduce(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  // Typing effect for the role line
  useEffect(() => {
    const doing = boards[key].doing;
    if (reduce) {
      setTyped(doing);
      return;
    }
    let i = 0;
    setTyped("");
    const timer = window.setInterval(() => {
      i += 1;
      setTyped(doing.slice(0, i));
      if (i >= doing.length) window.clearInterval(timer);
    }, 38);
    return () => window.clearInterval(timer);
  }, [key, reduce]);

  // Progress bars fill shortly after a board is shown
  useEffect(() => {
    setReady(false);
    const timer = window.setTimeout(() => setReady(true), 80);
    return () => window.clearTimeout(timer);
  }, [key]);

  // The first task moves to review, like a live board
  useEffect(() => {
    setBumped(false);
    if (reduce) return;
    const timer = window.setTimeout(() => setBumped(true), 3200);
    return () => window.clearTimeout(timer);
  }, [key, reduce]);

  // Weekly update checklist and cursor loop
  useEffect(() => {
    if (reduce) return;
    const timer = window.setInterval(() => setTick((n) => n + 1), 1500);
    return () => window.clearInterval(timer);
  }, [reduce]);

  const board = boards[key];
  const step = reduce ? updateItems.length : tick % (updateItems.length + 1);
  const [cx, cy] = reduce ? [0, 0] : spots[step % spots.length];
  const showBars = ready || reduce;
  const rows: Row[] = board.rows.map((row, i) =>
    i === 0 && bumped ? [row[0], row[1], "review", "In review", 92] : row,
  );
  const chosen = options.find((option) => option.key === key);

  return (
    <div className="wrap hero__grid">
      <div className="hero__copy">
        {intro}
        <Section id="brief" labelledBy="brief-title" className="hero__brief">
          <h2 className="hero__q" id="brief-title">
            {briefTitle}
          </h2>
          <p className="hero__qsub">{briefSub}</p>
          <ul className="chips" role="group" aria-labelledby="brief-title" data-chips-custom>
            {options.map((option) => (
              <li key={option.key}>
                <button
                  className="chip"
                  type="button"
                  aria-pressed={option.key === key}
                  onClick={() => setKey(option.key)}
                >
                  <V2Icon name="check-c" size={16} />
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        </Section>
        <div className="hero__cta">
          <a
            className="btn btn--grad"
            href="#contact"
            data-hero-go
            onClick={() => {
              if (chosen) selectService(chosen.service);
              track("consultation_click", "hero", "#contact");
            }}
          >
            {goLabel} <V2Icon name="arrow" />
          </a>
          <div className="hero__note">{note}</div>
          {secondary}
        </div>
      </div>

      <div className="hstage" aria-hidden="true">
        <div className="hstage__in">
          <div className="rolecard">
            <img src={v2img(`char-${board.ava}`)} alt="" />
            <span>
              <b>{board.role}</b>
              <span className="typing">{typed}</span>
            </span>
          </div>
          <div className="hboard">
            <div className="hboard__rail">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>
            <div className="hboard__main">
              <div className="hboard__title">{board.title}</div>
              <div className="hboard__tabs">
                <span className="on">Main table</span>
                <span>Timeline</span>
                <span>Kanban</span>
                <span>+</span>
              </div>
              <div className="grp-t">This sprint</div>
              <div className="tbl">
                <div className="tr tr--h">
                  <span>Task</span>
                  <span>Owner</span>
                  <span>Status</span>
                  <span>Progress</span>
                </div>
                {rows.map(([task, owner, status, label, percent], i) => (
                  <div key={`${key}-${i}`} className="tr rowin" style={{ animationDelay: `${i * 70}ms` }}>
                    <span>{task}</span>
                    <span className="who">
                      <img src={v2img(`char-${owner}`)} alt="" />
                    </span>
                    <span className={`st st--${status}`}>{label}</span>
                    <span>
                      <i className="bar">
                        <b style={{ width: showBars ? `${percent}%` : "0%" }} />
                      </i>
                    </span>
                  </div>
                ))}
              </div>
              <div className="grp-t grp-t--b">Released</div>
              <div className="tbl tbl--b">
                {board.done.map(([task, owner], i) => (
                  <div key={`${key}-done-${i}`} className="tr rowin" style={{ animationDelay: `${300 + i * 70}ms` }}>
                    <span>{task}</span>
                    <span className="who">
                      <img src={v2img(`char-${owner}`)} alt="" />
                    </span>
                    <span className="st st--done">Done</span>
                    <span>
                      <i className="bar">
                        <b style={{ width: "100%", background: "var(--s-done)" }} />
                      </i>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="upd">
            <div className="upd__h">
              <img src={v2img("char-devops")} alt="" />
              <span>
                <b>Weekly update</b>
                <span>Shared with your team</span>
              </span>
            </div>
            <p className="upd__ask">What is ready for review this week?</p>
            <p className="upd__label">
              <i />
              Preparing your update
            </p>
            <ul>
              {updateItems.map((item, i) => (
                <li key={item} className={i < step ? "on" : undefined}>
                  <i>
                    <V2Icon name="check" />
                  </i>
                  {item}
                </li>
              ))}
            </ul>
            <div className="upd__thumbs">
              <img src={v2img("char-design")} alt="" />
              <img src={v2img("char-mobile")} alt="" />
            </div>
          </div>
          <svg className="cursor" data-cursor aria-hidden="true" style={{ transform: `translate(${cx}px, ${cy}px)` }}>
            <use href="#i-cursor" />
          </svg>
        </div>
      </div>
    </div>
  );
}
