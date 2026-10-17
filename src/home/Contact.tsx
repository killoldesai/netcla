"use client";
import { LeadForm } from "../render";
import { V2Icon } from "../site/v2/ui";
import { serviceOptions, timelineOptions } from "./copy";
import { Section, T, useHome, useText } from "./ui";

// Enquiry form and its "What happens next" aside. The form logic (fields, validation,
// honeypot, /api/leads submission, analytics and preview mode) is LeadForm in src/render.tsx.
export function Contact() {
  const { preview } = useHome();
  const text = useText();
  return (
    <Section id="contact" labelledBy="contact-title" className="sec">
      <div className="wrap">
        <div className="enq">
          <div className="rv">
            <p className="label">
              <T k="home-368" />
            </p>
            <h2 id="contact-title">
              <T k="contact-title-1" /> <T k="contact-title-2" />
            </h2>
            <p className="enq__lead">
              <T k="home-369" />
            </p>
            <h3 className="next__title">
              <T k="next-title" />
            </h3>
            <ol className="next">
              {["next-1", "next-2", "next-3"].map((slot, i) => (
                <li key={slot}>
                  <b aria-hidden="true">{i + 1}</b>
                  <span>
                    <T k={slot} />
                  </span>
                </li>
              ))}
            </ol>
            <p className="contact__alt">
              <T k="home-370" /> <T k="home-371" />
            </p>
          </div>

          <LeadForm preview={preview}>
            <h3>
              <T k="t172" />
            </h3>
            <p className="form__req">
              <T k="t173" />
            </p>
            <div className="fgrid">
              <div className="field">
                <label htmlFor="lead-name">
                  <T k="home-164" />
                </label>
                <input
                  id="lead-name"
                  name="name"
                  autoComplete="name"
                  placeholder="Name"
                  required
                  maxLength={120}
                />
              </div>
              <div className="field">
                <label htmlFor="lead-email">
                  <T k="t175" />
                </label>
                <input
                  id="lead-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@company.com"
                  required
                  maxLength={254}
                  aria-describedby="lead-email-hint"
                />
                <span id="lead-email-hint" className="help">
                  <T k="form-email-hint" />
                </span>
              </div>
              <div className="field field--full">
                <label htmlFor="f-svc">
                  <T k="t176" />
                </label>
                <select
                  id="f-svc"
                  name="service"
                  required
                  defaultValue=""
                >
                  <option value="">{text("t177")}</option>
                  {serviceOptions.map((slot) => (
                    <option key={slot}>{text(slot)}</option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="lead-country">
                  <T k="t186" />{" "}
                  <small>
                    (<T k="form-optional" />)
                  </small>
                </label>
                <input
                  id="lead-country"
                  name="country"
                  autoComplete="country-name"
                  placeholder="Where are you based?"
                />
              </div>
              <div className="field">
                <label htmlFor="lead-timeline">
                  <T k="t187" />{" "}
                  <small>
                    (<T k="form-optional" />)
                  </small>
                </label>
                <select id="lead-timeline" name="timeline" defaultValue="">
                  <option value="">{text("t188")}</option>
                  {timelineOptions.map((slot) => (
                    <option key={slot}>{text(slot)}</option>
                  ))}
                </select>
              </div>
              <div className="field field--full">
                <label htmlFor="lead-goal">
                  <T k="t192" />
                </label>
                <textarea
                  id="lead-goal"
                  name="goal"
                  rows={4}
                  placeholder="What are you trying to achieve?"
                  required
                  minLength={10}
                  maxLength={5000}
                />
              </div>
            </div>
            <button type="submit" className="btn btn--grad">
              <T k="t193" /> <V2Icon name="arrow" />
            </button>
            <p className="form__legal">
              {preview
                ? text("t195")
                : "Your information is used to respond to your enquiry."}
            </p>
          </LeadForm>
        </div>
      </div>
    </Section>
  );
}
