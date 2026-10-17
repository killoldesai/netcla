// Decorative product mockups for v2 deliverable visuals (aria-hidden), picked by the content's icon_key.
// They show abstract UI only: generic interface labels, no claims, numbers or client names. Motion is CSS
// (public/assets/v2/pages/showcase.css) and stops under prefers-reduced-motion.
import { TechMark, V2Icon, v2img } from "./ui";

export type Kind = "board" | "billing" | "auth" | "api" | "dashboard" | "pipeline" | "mobile" | "chat" | "shop" | "site" | "roster" | "sector" | "zones" | "hub" | "crew" | "stages" | "plans" | "checklist" | "gallery";

const KIND_BY_KEY: Record<string, Kind> = {
  "layers-stack": "board",
  "code-brackets": "board",
  "react-atom": "board",
  "settings-gear": "billing",
  "shield-check": "auth",
  "users-group": "auth",
  "api-plug": "api",
  "nodejs-hexagon": "api",
  "chart-bar": "dashboard",
  "document-text": "dashboard",
  "cloud-upload": "pipeline",
  "aws-cloud": "pipeline",
  "docker-whale": "pipeline",
  "kubernetes-wheel": "pipeline",
  "terraform-blocks": "pipeline",
  "rocket-launch": "pipeline",
  "mobile-device": "mobile",
  "flutter-diamond": "mobile",
  "brain-circuit": "chat",
  "python-snake": "chat",
};
const ORDER: Kind[] = ["board", "billing", "auth", "api", "dashboard", "pipeline"];

export function mockKind(iconKey: string | undefined, index: number): Kind {
  return (iconKey && KIND_BY_KEY[iconKey]) || ORDER[index % ORDER.length];
}

function Bar({ title, tag }: { title: string; tag?: string }) {
  return (
    <div className="mock__bar">
      <span className="board__dots"><i /><i /><i /></span>
      {title}
      {tag && <small>{tag}</small>}
    </div>
  );
}

export function DeliverMock({ kind, title, stack = [] }: { kind: Kind; title: string; stack?: string[] }) {
  const ava = (c: string) => <img src={v2img(`char-${c}`)} alt="" />;
  switch (kind) {
    case "board":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Workspace" />
          <div className="kb">
            <div className="kb__col"><span className="kb__h" style={{ background: "var(--s-none)" }}>To do</span><span className="kb__c kb__c--move">Settings {ava("node")}</span><span className="kb__c">Invite team {ava("react")}</span></div>
            <div className="kb__col"><span className="kb__h" style={{ background: "var(--s-work)" }}>Working on it</span><span className="kb__c">Workspace {ava("fullstack")}</span><span className="kb__c">Roles {ava("design")}</span></div>
            <div className="kb__col"><span className="kb__h" style={{ background: "var(--s-done)" }}>Done</span><span className="kb__c">Sign up {ava("qa")}</span><span className="kb__c">Login {ava("cloud")}</span></div>
          </div>
        </div>
      );
    case "billing":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Plans" />
          <div className="dm-plans">
            {["Starter", "Growth", "Scale"].map((p, i) => (
              <div key={p} className={"dm-plan" + (i === 1 ? " on" : "")}>
                <b>{p}</b>
                <i style={{ width: `${40 + i * 20}%` }} />
                <i style={{ width: `${30 + i * 15}%` }} />
                <span className="dm-btn" />
              </div>
            ))}
          </div>
          <div className="dm-rows">
            {["Invoice", "Invoice", "Invoice"].map((r, i) => (
              <div key={i} className="dm-row" style={{ animationDelay: `${i * 0.5}s` }}><span>{r}</span><i /><em className="pill-ok">Paid</em></div>
            ))}
          </div>
        </div>
      );
    case "auth":
      return (
        <div className="dm-auth">
          <div className="mock dm-login">
            <Bar title="Sign in" />
            <div className="dm-pad">
              <span className="dm-input"><V2Icon name="mail" /> <i /></span>
              <span className="dm-input"><V2Icon name="lock" /> <i /></span>
              <span className="dm-submit">Continue <V2Icon name="arrow" /></span>
            </div>
          </div>
          <div className="mock dm-roles">
            <Bar title={title} tag="Roles" />
            <div className="dm-pad">
              {[["Owner", "lead"], ["Admin", "fullstack"], ["Member", "design"]].map(([r, c], i) => (
                <div key={r} className="dm-role">{ava(c)}<b>{r}</b><span className={"dm-switch" + (i < 2 ? " on" : "")} style={{ animationDelay: `${i * 0.6}s` }} /></div>
              ))}
            </div>
          </div>
        </div>
      );
    case "api":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Endpoints" />
          <div className="dm-api">
            {[["GET", "/tenants"], ["POST", "/subscriptions"], ["PUT", "/users/:id"], ["DELETE", "/sessions/:id"]].map(([v, p], i) => (
              <div key={p} className="dm-ep" style={{ animationDelay: `${i * 0.35}s` }}>
                <span className={`verb verb--${v.toLowerCase()}`}>{v}</span>
                <code>{p}</code>
                <em className="pill-ok">200</em>
              </div>
            ))}
          </div>
          <div className="log"><span><b>✓</b>schema validated</span><span><b className="w">●</b>request in flight</span></div>
        </div>
      );
    case "dashboard":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Admin" />
          <div className="dm-dash">
            <div className="dm-kpis">{[0, 1, 2].map((i) => <span key={i}><i /><b /></span>)}</div>
            <div className="dm-chart">{[38, 62, 45, 80, 58, 92, 70].map((h, i) => <i key={i} style={{ height: `${h}%`, animationDelay: `${i * 0.12}s` }} />)}</div>
          </div>
        </div>
      );
    case "pipeline":
      return (
        <div className="mock dm">
          <Bar title={title} tag="main" />
          <ol className="pipe">
            <li className="ok"><i><V2Icon name="check" /></i>Commit</li>
            <li className="ok"><i><V2Icon name="check" /></i>Build</li>
            <li className="ok"><i><V2Icon name="check" /></i>Test</li>
            <li className="run"><i />Staging</li>
            <li><i />Production</li>
          </ol>
          <div className="log">
            {stack.slice(0, 2).map((t) => <span key={t}><b>✓</b>{t.toLowerCase()} ready</span>)}
            <span><b className="w">●</b>deploying to staging</span>
          </div>
        </div>
      );
    case "mobile":
      return (
        <div className="phones">
          <div className="phone"><div className="phone__s"><span className="push"><i /><s /></span><b style={{ width: "60%" }} /><span style={{ background: "var(--p-lavender)" }} /><em><i style={{ background: "var(--p-lime)" }} /><i style={{ background: "var(--p-sky)" }} /></em><span className="btnm" /></div></div>
          <div className="phone phone--b"><div className="phone__s"><b style={{ width: "45%" }} /><em><i style={{ background: "var(--p-peach)" }} /><i style={{ background: "var(--p-lavender)" }} /></em><span style={{ background: "var(--p-lime)" }} /><span className="btnm" /></div></div>
        </div>
      );
    case "shop":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Store" />
          <div className="dm-shop">
            <div className="dm-products">
              {["var(--p-lavender)", "var(--p-peach)", "var(--p-sky)", "var(--p-lime)"].map((c, i) => (
                <span key={i} className={"dm-prod" + (i === 1 ? " on" : "")} style={{ animationDelay: `${i * 0.2}s` }}>
                  <i style={{ background: c }} />
                  <b />
                  <u />
                </span>
              ))}
            </div>
            <div className="dm-cart">
              <b>Cart</b>
              <span><i /><em /></span>
              <span><i /><em /></span>
              <ol className="dm-steps">
                <li className="ok">Details</li>
                <li className="ok">Shipping</li>
                <li className="run">Payment</li>
              </ol>
              <span className="dm-submit">Place order <V2Icon name="arrow" /></span>
            </div>
          </div>
        </div>
      );
    case "site":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Preview" />
          <div className="dm-site">
            <div className="dm-site__hero"><b /><i /><i /><span className="dm-btn" /></div>
            <div className="dm-site__cards">
              {[0, 1, 2].map((i) => (
                <span key={i} style={{ animationDelay: `${i * 0.25}s` }}><i style={{ background: ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)"][i] }} /><b /><u /></span>
              ))}
            </div>
            <div className="log"><span><b>✓</b>layout checked on phone and desktop</span><span><b className="w">●</b>publishing preview</span></div>
          </div>
        </div>
      );
    case "hub": {
      const spots = [[20, 16], [50, 6], [80, 16], [20, 84], [50, 94], [80, 84]];
      const nodes = stack.slice(0, 6);
      return (
        <div className="mock dm">
          <Bar title={title} tag="Services" />
          <div className="dm-hub">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
              {nodes.map((_, i) => (
                <line key={i} x1="50" y1="50" x2={spots[i][0]} y2={spots[i][1]} style={{ animationDelay: `${i * 0.2}s` }} />
              ))}
            </svg>
            <span className="dm-hub__core">
              <V2Icon name="layers" />
            </span>
            {nodes.map((n, i) => (
              <span key={n} className="dm-hub__n" style={{ left: `${spots[i][0]}%`, top: `${spots[i][1]}%`, animationDelay: `${0.3 + i * 0.2}s` }}>
                {n.replace(/\s+(development|services?)$/i, "")}
              </span>
            ))}
          </div>
        </div>
      );
    }
    case "roster":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Profile" />
          <div className="dm-roster">
            <div className="dm-roster__top">
              <img src={v2img("char-fullstack")} alt="" />
              <span>
                <b>{title}</b>
                <em>
                  <i /> Matched to your brief
                </em>
              </span>
            </div>
            <div className="dm-roster__chips">
              {stack.slice(0, 6).map((t, i) => (
                <span key={t} style={{ animationDelay: `${0.3 + i * 0.15}s` }}>
                  {t}
                </span>
              ))}
            </div>
            <ol className="dm-steps dm-steps--row">
              <li className="ok">Brief</li>
              <li className="ok">Interview</li>
              <li className="run">Trial</li>
              <li>Onboarding</li>
            </ol>
          </div>
        </div>
      );
    case "sector":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Overview" />
          <div className="dm-sector">
            <div className="dm-sector__list">
              {["Record", "Record", "Record", "Record"].map((r, i) => (
                <span key={i} className="dm-row" style={{ animationDelay: `${i * 0.4}s` }}>
                  <span>{r}</span>
                  <i />
                  <em className={i === 2 ? "pill-wait" : "pill-ok"}>{i === 2 ? "Review" : "Done"}</em>
                </span>
              ))}
            </div>
            <div className="dm-sector__checks">
              <b>
                <V2Icon name="shield" /> Compliance checks
              </b>
              {["Access controls", "Audit log", "Data retention"].map((c, i) => (
                <span key={c} style={{ animationDelay: `${0.6 + i * 0.5}s` }}>
                  <V2Icon name="check" />
                  {c}
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    case "zones":
      return (
        <div className="mock dm">
          <Bar title={title} tag="Schedule" />
          <div className="dm-zones">
            {[["Your team", "a"], ["Our team", "b"], ["Shared hours", "c"]].map(([label, k]) => (
              <div key={k} className="dm-zone">
                <b>{label}</b>
                <span className="dm-zone__bar">
                  <i className={`dm-zone__${k}`} />
                </span>
              </div>
            ))}
            <p className="dm-zones__note">
              <V2Icon name="clock" /> Daily stand-up inside the shared hours
            </p>
          </div>
        </div>
      );
    case "crew": {
      const roles = [["lead", "Lead"], ["fullstack", "Engineering"], ["design", "Design"], ["qa", "QA"], ["cloud", "Cloud"]];
      return (
        <div className="mock dm">
          <Bar title={title} tag="Team" />
          <div className="dm-crew">
            <div className="dm-crew__grid">
              {roles.map(([c, label], i) => (
                <span key={c} className="dm-crew__p" style={{ animationDelay: `${i * 0.15}s` }}>
                  <img src={v2img(`char-${c}`)} alt="" />
                  <b>{label}</b>
                </span>
              ))}
            </div>
            <ol className="dm-steps dm-steps--row">
              <li className="ok">Brief</li>
              <li className="ok">Build</li>
              <li className="run">Test</li>
              <li>Launch</li>
            </ol>
          </div>
        </div>
      );
    }
    case "stages": {
      const list = (stack.length ? stack : ["Discover", "Design", "Build", "Test", "Launch"]).slice(0, 6);
      return (
        <div className="mock dm">
          <Bar title={title} tag="Stages" />
          <ol className="dm-stages">
            {list.map((t, i) => (
              <li key={t} style={{ animationDelay: `${i * 1.4}s`, animationDuration: `${list.length * 1.4}s` }}>
                <i>{i + 1}</i>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      );
    }
    case "plans": {
      const names = (stack.length ? stack : ["Option A", "Option B", "Option C"]).slice(0, 3);
      return (
        <div className="mock dm">
          <Bar title={title} tag="Models" />
          <div className="dm-plans2">
            {names.map((n, i) => (
              <div key={n} className="dm-plan2" style={{ animationDelay: `${i * 2}s`, animationDuration: `${names.length * 2}s` }}>
                <b>{n}</b>
                <i />
                <i />
                <i />
                <span className="dm-btn" />
              </div>
            ))}
          </div>
        </div>
      );
    }
    case "checklist": {
      const list = (stack.length ? stack : ["Scope written first", "One named lead", "Code and IP are yours"]).slice(0, 5);
      return (
        <div className="mock dm">
          <Bar title={title} tag="Checklist" />
          <ul className="dm-check">
            {list.map((t, i) => (
              <li key={t} style={{ animationDelay: `${0.3 + i * 0.35}s` }}>
                <i>
                  <V2Icon name="check" />
                </i>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    }
    case "gallery": {
      const tags = (stack.length ? stack : ["All", "Software", "Mobile", "AI"]).slice(0, 4);
      const tints = ["var(--p-lavender)", "var(--p-sky)", "var(--p-lime)", "var(--p-peach)"];
      return (
        <div className="mock dm">
          <Bar title={title} tag="Library" />
          <div className="dm-gal">
            <div className="dm-gal__tags">
              {tags.map((t, i) => (
                <span key={t} style={{ animationDelay: `${i * 1.6}s`, animationDuration: `${tags.length * 1.6}s` }}>
                  {t}
                </span>
              ))}
            </div>
            <div className="dm-gal__grid">
              {tints.map((c, i) => (
                <span key={i} style={{ animationDelay: `${i * 0.2}s` }}>
                  <i style={{ background: c }} />
                  <b />
                  <u />
                </span>
              ))}
            </div>
          </div>
        </div>
      );
    }
    case "chat":
      return (
        <div className="mock chat dm">
          <Bar title={title} tag="Assistant" />
          <div className="chat__b">
            <p className="bub bub--me dm-bub">A question from a user</p>
            <div className="bub bub--ai dm-bub2">An answer grounded in your own content.<small><V2Icon name="doc" />source</small></div>
            <span className="flag dm-flag"><V2Icon name="users" />A person reviews before sending</span>
          </div>
        </div>
      );
  }
}

/** Technology row for a marquee: brand logos (or monograms) with names. */
export function TechRow({ items, reverse = false }: { items: string[]; reverse?: boolean }) {
  return (
    <div className="marquee">
      <ul className={"marquee__track" + (reverse ? " marquee__track--rev" : "")} data-marquee>
        {items.map((t) => (
          <li key={t}><TechMark name={t} size={34} />{t}</li>
        ))}
      </ul>
    </div>
  );
}
