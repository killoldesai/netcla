// Decorative mocks on the engagement model cards (html-prototype/v2/index.html). Shown aria-hidden beside the copy.
import { V2Img } from "../../site/v2/ui";

export function PlanMock() {
  return (
    <div className="mcard__m" aria-hidden="true">
      <p className="pp__t">Project plan</p>
      <div className="pp__tabs"><span className="on">Main table</span><span>Gantt</span><span>Kanban</span></div>
      <div className="grp-t">This project</div>
      <div className="tbl tbl--plan">
        <div className="tr tr--h"><span>Milestone</span><span>Owner</span><span>Timeline</span><span>Status</span></div>
        <div className="tr"><span>Scope summary</span><span className="who"><V2Img name="char-design" /></span><span><i className="tline"><b style={{ left: 0, width: "30%" }} /></i></span><span className="st st--done">Done</span></div>
        <div className="tr"><span>Interface designs</span><span className="who"><V2Img name="char-fullstack" /></span><span><i className="tline"><b style={{ left: "20%", width: "35%" }} /></i></span><span className="st st--done">Done</span></div>
        <div className="tr"><span>Staging build</span><span className="who"><V2Img name="char-cloud" /></span><span><i className="tline"><b style={{ left: "45%", width: "35%" }} /></i></span><span className="st st--work">Working on it</span></div>
        <div className="tr"><span>Production release</span><span className="who"><V2Img name="char-devops" /></span><span><i className="tline"><b style={{ left: "75%", width: "25%", background: "var(--s-none)" }} /></i></span><span className="st st--none">Up next</span></div>
      </div>
      <div className="agentchip"><V2Img name="char-ai" />Preparing the handover</div>
    </div>
  );
}

export function RosterMock() {
  return (
    <div className="mcard__m" aria-hidden="true">
      <p className="pp__t">Your roadmap team</p>
      <div className="pp__tabs"><span className="on">Team</span><span>Roadmap</span><span>Updates</span></div>
      <div className="roster">
        <div><V2Img name="char-fullstack" /><span><b>Full stack developer</b><span>Customer portal</span></span><em style={{ background: "var(--s-done)" }}>On roadmap</em></div>
        <div><V2Img name="char-ai" /><span><b>AI/ML developer</b><span>Document search</span></span><em style={{ background: "var(--s-work)" }}>This quarter</em></div>
        <div><V2Img name="char-mobile" /><span><b>Mobile developer</b><span>iOS and Android apps</span></span><em style={{ background: "var(--s-done)" }}>On roadmap</em></div>
        <div><V2Img name="char-devops" /><span><b>DevOps engineer</b><span>Release pipeline</span></span><em style={{ background: "var(--s-review)" }}>Next quarter</em></div>
      </div>
    </div>
  );
}

export function TeamToolsMock() {
  return (
    <div className="mcard__m mcard__m--dark" aria-hidden="true">
      <p className="pp__t" style={{ color: "var(--snow)" }}>Your team, your tools</p>
      <div className="dk__row dk__row--h"><span>Task</span><span>Status</span><span>Owner</span></div>
      <div className="dk__row"><span>Checkout redesign</span><em style={{ background: "var(--s-done)" }}>Done</em><V2Img name="char-design" /></div>
      <div className="dk__row"><span>Payments API</span><em style={{ background: "var(--s-work)" }}>In progress</em><V2Img name="char-cloud" /></div>
      <div className="dk__row"><span>Search indexing</span><em style={{ background: "var(--s-review)" }}>In review</em><V2Img name="char-ai" /></div>
      <div className="dk__row dk__row--new"><span>Flutter app sprint</span><em style={{ background: "var(--violet)", color: "var(--snow)" }}>Joined your sprint</em><V2Img name="char-mobile" /></div>
    </div>
  );
}
