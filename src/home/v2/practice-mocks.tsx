// Decorative product mockups shown beside each practice tab on the homepage (html-prototype/v2/index.html).
// They are aria-hidden in the page, so they carry no content of their own beyond the prototype's sample board.
import { V2Icon, V2Img } from "../../site/v2/ui";

export function SoftwareMock() {
  return (
    <div className="mock">
      <div className="mock__bar">
        Sprint board<small>Web app</small>
      </div>
      <div className="kb">
        <div className="kb__col">
          <span className="kb__h" style={{ background: "var(--s-none)" }}>To do</span>
          <span className="kb__c kb__c--move">Orders API<V2Img name="char-cloud" /></span>
          <span className="kb__c">Admin roles<V2Img name="char-fullstack" /></span>
          <span className="kb__c">Billing export<V2Img name="char-cloud" /></span>
        </div>
        <div className="kb__col">
          <span className="kb__h" style={{ background: "var(--s-work)" }}>Working on it</span>
          <span className="kb__c">Customer portal<V2Img name="char-design" /></span>
          <span className="kb__c">CRM sync<V2Img name="char-fullstack" /></span>
        </div>
        <div className="kb__col">
          <span className="kb__h" style={{ background: "var(--s-done)" }}>Done</span>
          <span className="kb__c">Login flow<V2Img name="char-fullstack" /></span>
          <span className="kb__c">Invoices<V2Img name="char-cloud" /></span>
        </div>
      </div>
    </div>
  );
}

export function AiMock() {
  return (
    <div className="mock chat">
      <div className="mock__bar">
        <V2Icon name="spark" size={20} className="mock__icon" />
        Support assistant<small>Your documents</small>
      </div>
      <div className="chat__b">
        <p className="bub bub--me">Which plans include priority support?</p>
        <div className="bub bub--ai">
          Priority support is listed for two plans in your pricing policy. I drafted a reply with the relevant section quoted.
          <small>
            <V2Icon name="doc" />
            pricing-policy.pdf
          </small>
        </div>
        <span className="flag">
          <V2Icon name="users" />
          A person reviews before sending
        </span>
      </div>
      <div className="askbar">
        <V2Icon name="spark" />
        Ask about your documents<span className="go"><V2Icon name="arrow" /></span>
      </div>
    </div>
  );
}

export function DevOpsMock() {
  return (
    <div className="mock">
      <div className="mock__bar">
        Release pipeline<small>main branch</small>
      </div>
      <ol className="pipe">
        <li className="ok"><i><V2Icon name="check" /></i>Commit</li>
        <li className="ok"><i><V2Icon name="check" /></i>Build</li>
        <li className="ok"><i><V2Icon name="check" /></i>Test</li>
        <li className="run"><i /><span>Staging</span></li>
        <li><i />Production</li>
      </ol>
      <div className="log">
        <span><b>✓</b>docker build</span>
        <span><b>✓</b>run test suite</span>
        <span><b>✓</b>terraform plan</span>
        <span><b className="w">●</b>kubectl rollout to staging</span>
      </div>
    </div>
  );
}

export function MobileMock() {
  return (
    <div className="phones">
      <div className="phone">
        <div className="phone__s">
          <span className="push"><i /><s /></span>
          <b style={{ width: "60%" }} />
          <span style={{ background: "var(--p-lavender)" }} />
          <em><i style={{ background: "var(--p-lime)" }} /><i style={{ background: "var(--p-sky)" }} /></em>
          <span style={{ background: "var(--p-peach)", height: 50 }} />
          <span className="btnm" />
        </div>
      </div>
      <div className="phone phone--b">
        <div className="phone__s">
          <b style={{ width: "45%" }} />
          <em><i style={{ background: "var(--p-peach)" }} /><i style={{ background: "var(--p-lavender)" }} /></em>
          <span style={{ background: "var(--p-lime)" }} />
          <span style={{ background: "var(--p-sky)", height: 50 }} />
          <span className="btnm" />
        </div>
      </div>
    </div>
  );
}

export function CloudMock() {
  return (
    <div className="mock">
      <div className="mock__bar">
        Architecture<small>Migration plan</small>
      </div>
      <div className="arch">
        <div className="arch__tabs"><span className="on">AWS</span><span>Azure</span><span>Google Cloud</span></div>
        <span className="node" style={{ background: "var(--p-lavender)" }}>Users</span>
        <i className="ln" />
        <span className="node" style={{ background: "var(--p-sky)" }}>Load balancer</span>
        <i className="ln" />
        <span className="arch__pair">
          <span className="node" style={{ background: "var(--p-lime)" }}>App containers</span>
          <span className="node" style={{ background: "var(--p-lime)" }}>App containers</span>
        </span>
        <i className="ln" />
        <span className="arch__pair">
          <span className="node" style={{ background: "var(--p-peach)" }}>Database</span>
          <span className="node" style={{ background: "var(--p-peri)" }}>File storage</span>
        </span>
      </div>
    </div>
  );
}
