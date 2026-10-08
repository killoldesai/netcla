"use client";
import { useState } from "react";
export function CareerApplicationForm({
  id,
  title,
}: {
  id: string;
  title: string;
}) {
  const [status, setStatus] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <form
      className="form"
      onSubmit={async (event) => {
        event.preventDefault();
        if (busy) return;
        const form = new FormData(event.currentTarget);
        const cv = form.get("cv");
        if (cv instanceof File && cv.size > 5 * 1024 * 1024) {
          setStatus("Maximum CV size is 5 MB.");
          return;
        }
        setBusy(true);
        try {
          const response = await fetch("/api/careers/apply", {
            method: "POST",
            body: form,
          });
          const result = await response.json();
          setStatus(result.message || result.error);
        } catch {
          setStatus("Unable to submit. Please try again.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        <legend>Apply for {title}</legend>
        <input type="hidden" name="vacancyId" value={id} />
        <label>
          Name
          <input name="name" required autoComplete="name" maxLength={120} />
        </label>
        <label>
          Email
          <input name="email" type="email" required autoComplete="email" />
        </label>
        <label>
          Phone (optional)
          <input name="phone" type="tel" autoComplete="tel" />
        </label>
        <label>
          Cover message (optional)
          <textarea name="coverMessage" maxLength={5000} />
        </label>
        <label>
          CV — PDF or DOCX, up to 5 MB
          <input name="cv" type="file" accept=".pdf,.docx" required />
        </label>
        <label>
          <input name="consent" type="checkbox" required />I consent to
          Netofficials reviewing and storing my application for recruitment.
          Applications are retained for up to the configured recruitment period.
        </label>
        <label className="honeypot" aria-hidden="true">
          Company URL
          <input name="company_url" tabIndex={-1} autoComplete="off" />
        </label>
        <button className="v3-button" type="submit">
          {busy ? "Submitting…" : "Submit application"}
        </button>
      </fieldset>
      <p role="status" aria-live="polite">
        {status}
      </p>
    </form>
  );
}
