"use client";
import { LeadForm } from "../render";
import { serviceOptions, timelineOptions } from "./copy";
import {
  Block,
  ButtonLink,
  Cta,
  Section,
  SectionHead,
  T,
  container,
  useHome,
  useText,
} from "./ui";

const field =
  "mt-2 block h-12 w-full rounded-xl border border-n-line bg-n-paper px-4 text-[15px] text-n-ink outline-none transition-colors duration-150 placeholder:text-n-muted/70 focus:border-n-indigo focus:bg-white";
const label = "block text-[14px] font-medium text-n-ink";

export function CtaBand() {
  return (
    <Section id="cta" labelledBy="cta-title" className="py-6 lg:py-10">
      <div className={container}>
        <div
          data-reveal
          className="relative overflow-hidden rounded-[32px] bg-n-ink px-7 py-16 text-center text-white sm:px-12 lg:py-24"
        >
          <div className="relative">
            <h2
              id="cta-title"
              className="mx-auto max-w-[18ch] text-[clamp(2.25rem,5.5vw,4.25rem)] leading-[1.02] font-semibold tracking-[-0.04em]"
            >
              <T k="cta-title" />
              <br />
              <span className="text-n-lime">
                <T k="cta-title-2" />
              </span>
            </h2>
            <Block
              k="cta-body"
              className="mx-auto mt-6 max-w-[52ch] text-[18px] leading-[1.6] text-white/70"
            />
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Cta hub="closing" variant="light">
                <T k="cta-primary" />
              </Cta>
              <ButtonLink
                href="#services"
                className="border-white/25! bg-transparent! text-white! hover:border-white/60!"
              >
                <T k="cta-secondary" />
              </ButtonLink>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}

export function Contact() {
  const { preview } = useHome();
  const text = useText();
  return (
    <Section
      id="contact"
      labelledBy="contact-title"
      className="scroll-mt-20 py-20 lg:py-28"
    >
      <div className={container}>
        <SectionHead
          section="contact"
          id="contact-title"
          eyebrow="home-368"
          title={
            <>
              <T k="contact-title-1" />
              <br />
              <T k="contact-title-2" />
            </>
          }
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-5">
            <Block
              k="home-369"
              className="max-w-[44ch] text-[17px] leading-[1.6] text-n-muted"
            />
            <h3 className="mt-12 font-n-mono text-[12px] tracking-[0.08em] text-n-muted uppercase">
              <T k="next-title" />
            </h3>
            <ol className="mt-4 space-y-3">
              {["next-1", "next-2", "next-3"].map((slot, i) => (
                <li
                  key={slot}
                  className="flex items-start gap-4 rounded-2xl border border-n-ink/[0.07] bg-white p-4 text-[15px] leading-[1.5] shadow-n-card"
                >
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-n-indigo text-[13px] font-semibold text-white">
                    {i + 1}
                  </span>
                  <span className="pt-1">
                    <T k={slot} />
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 text-[13px] leading-[1.6] text-n-muted">
              <T k="home-370" />
              <br />
              <T k="home-371" />
            </p>
          </div>
          <div className="rounded-[28px] border border-n-ink/[0.07] bg-white p-6 text-n-ink shadow-n-float sm:p-8 lg:col-span-7 lg:p-10 [&_.error]:mt-4 [&_.error]:text-[14px] [&_.form-status]:mt-4 [&_.form-status]:text-[14px] [&_.form-status]:text-n-muted [&_.form-status:empty]:hidden">
            <LeadForm preview={preview}>
              <h3 className="text-[24px] font-semibold tracking-[-0.02em]">
                <T k="t172" />
              </h3>
              <p className="mt-1 text-[15px] text-n-muted">
                <T k="t173" />
              </p>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                <label className={label}>
                  <T k="home-164" />
                  <input
                    name="name"
                    autoComplete="name"
                    placeholder="Name"
                    required
                    maxLength={120}
                    className={field}
                  />
                </label>
                <label className={label}>
                  <T k="t175" />
                  <input
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@company.com"
                    required
                    maxLength={254}
                    className={field}
                  />
                </label>
                <label className={`${label} sm:col-span-2`}>
                  <T k="t176" />
                  <select
                    name="service"
                    id="service"
                    required
                    defaultValue=""
                    className={`${field} appearance-none bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10`}
                    style={{ backgroundImage: chevron }}
                  >
                    <option value="">{text("t177")}</option>
                    {serviceOptions.map((slot) => (
                      <option key={slot}>{text(slot)}</option>
                    ))}
                  </select>
                </label>
                <label className={label}>
                  <T k="t186" />
                  <input
                    name="country"
                    autoComplete="country-name"
                    placeholder="Where are you based?"
                    className={field}
                  />
                </label>
                <label className={label}>
                  <T k="t187" />
                  <select
                    name="timeline"
                    defaultValue=""
                    className={`${field} appearance-none bg-[length:12px] bg-[right_16px_center] bg-no-repeat pr-10`}
                    style={{ backgroundImage: chevron }}
                  >
                    <option value="">{text("t188")}</option>
                    {timelineOptions.map((slot) => (
                      <option key={slot}>{text(slot)}</option>
                    ))}
                  </select>
                </label>
                <label className={`${label} sm:col-span-2`}>
                  <T k="t192" />
                  <textarea
                    name="goal"
                    placeholder="What are you trying to achieve?"
                    required
                    minLength={10}
                    maxLength={5000}
                    rows={5}
                    className={`${field} h-auto py-3 leading-[1.5]`}
                  />
                </label>
              </div>
              <button
                type="submit"
                className="group/btn mt-6 inline-flex h-12 w-full items-center justify-between rounded-full bg-n-indigo px-6 text-[15px] font-medium text-white transition-colors duration-150 hover:bg-n-indigo-dark disabled:opacity-60"
              >
                <T k="t193" />
                <span aria-hidden="true">→</span>
              </button>
              <p className="mt-4 text-[13px] text-n-muted">
                {preview
                  ? text("t195")
                  : "Your information is used to respond to your enquiry."}
              </p>
            </LeadForm>
          </div>
        </div>
      </div>
    </Section>
  );
}

const chevron = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='m3 4.5 3 3 3-3' fill='none' stroke='%230f1420' stroke-width='1.5'/%3E%3C/svg%3E")`;
