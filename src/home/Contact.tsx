"use client";
import { LeadForm } from "../render";
import { Icon, SectionHead } from "../site/ui";
import { serviceOptions, timelineOptions } from "./copy";
import { Section, T, useHome, useText } from "./ui";

// Enquiry form and its "What happens next" aside. The form logic (fields, validation,
// honeypot, /api/leads submission, analytics and preview mode) is LeadForm in src/render.tsx.
export function Contact() {
  const { preview } = useHome();
  const text = useText();
  return (
    <Section id="contact" labelledBy="contact-title" className="section">
      <div className="container contact">
        <div className="nx-reveal">
          <SectionHead
            id="contact-title"
            eyebrow={<T k="home-368" />}
            title={
              <>
                <T k="contact-title-1" /> <T k="contact-title-2" />
              </>
            }
            lead={<T k="home-369" />}
          />
          <h3 className="next__title">
            <T k="next-title" />
          </h3>
          <ol className="next">
            {["next-1", "next-2", "next-3"].map((slot) => (
              <li key={slot}>
                <T k={slot} />
              </li>
            ))}
          </ol>
          <p className="contact__alt">
            <T k="home-370" /> <T k="home-371" />
          </p>
        </div>

        <LeadForm preview={preview}>
          <div>
            <h3 className="form__title">
              <T k="t172" />
            </h3>
          </div>
          <p className="form__sub">
            <T k="t173" />
          </p>
          <div className="form__row">
            <div className="nx-field">
              <label htmlFor="lead-name">
                <T k="home-164" />
              </label>
              <input
                id="lead-name"
                name="name"
                className="nx-field__control"
                autoComplete="name"
                placeholder="Name"
                required
                maxLength={120}
              />
            </div>
            <div className="nx-field">
              <label htmlFor="lead-email">
                <T k="t175" />
              </label>
              <input
                id="lead-email"
                name="email"
                type="email"
                className="nx-field__control"
                autoComplete="email"
                placeholder="you@company.com"
                required
                maxLength={254}
                aria-describedby="lead-email-hint"
              />
              <span id="lead-email-hint" className="nx-field__hint">
                <T k="form-email-hint" />
              </span>
            </div>
          </div>
          <div className="nx-field">
            <label htmlFor="service">
              <T k="t176" />
            </label>
            <select
              id="service"
              name="service"
              className="nx-field__control"
              required
              defaultValue=""
            >
              <option value="">{text("t177")}</option>
              {serviceOptions.map((slot) => (
                <option key={slot}>{text(slot)}</option>
              ))}
            </select>
          </div>
          <div className="form__row">
            <div className="nx-field">
              <label htmlFor="lead-country">
                <T k="t186" />{" "}
                <span className="form__opt">
                  (<T k="form-optional" />)
                </span>
              </label>
              <input
                id="lead-country"
                name="country"
                className="nx-field__control"
                autoComplete="country-name"
                placeholder="Where are you based?"
              />
            </div>
            <div className="nx-field">
              <label htmlFor="lead-timeline">
                <T k="t187" />{" "}
                <span className="form__opt">
                  (<T k="form-optional" />)
                </span>
              </label>
              <select
                id="lead-timeline"
                name="timeline"
                className="nx-field__control"
                defaultValue=""
              >
                <option value="">{text("t188")}</option>
                {timelineOptions.map((slot) => (
                  <option key={slot}>{text(slot)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="nx-field">
            <label htmlFor="lead-goal">
              <T k="t192" />
            </label>
            <textarea
              id="lead-goal"
              name="goal"
              className="nx-field__control"
              rows={4}
              placeholder="What are you trying to achieve?"
              required
              minLength={10}
              maxLength={5000}
            />
          </div>
          <button type="submit" className="nx-btn nx-btn--primary nx-btn--lg">
            <span>
              <T k="t193" />
            </span>
            <Icon
              name="arrow-right"
              size={18}
              className="nx-icon nx-btn__arrow"
            />
          </button>
          <p className="form__legal">
            {preview
              ? text("t195")
              : "Your information is used to respond to your enquiry."}
          </p>
        </LeadForm>
      </div>
    </Section>
  );
}
