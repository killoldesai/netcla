"use client";
import { useEffect, useState } from "react";
import { adminFetch, Panel } from "../admin-console";

type Status = {
  provider: "local" | "s3";
  bucket: string;
  region: string;
  prefix: string;
  accessKeyId: string;
  hasSecret: boolean;
  publicBaseUrl: string;
};

/** Where images and uploads are stored: this server's disk or an Amazon S3 bucket. */
export function StorageSettings() {
  const [status, setStatus] = useState<Status | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [form, setForm] = useState({
    provider: "local" as "local" | "s3",
    bucket: "",
    region: "",
    prefix: "netofficials/",
    accessKeyId: "",
    secretAccessKey: "",
    publicBaseUrl: "",
  });
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    adminFetch("/api/admin/console/storage").then((d) => {
      setStatus(d.status);
      setRegions(d.regions);
      setForm((f) => ({
        ...f,
        provider: d.status.provider,
        bucket: d.status.bucket,
        region: d.status.region || "ap-south-1",
        prefix: d.status.prefix || "netofficials/",
        publicBaseUrl: d.status.publicBaseUrl,
      }));
    });
  }, []);

  const input = () => ({
    provider: form.provider,
    prefix: form.prefix,
    ...(form.provider === "s3"
      ? {
          bucket: form.bucket,
          region: form.region,
          accessKeyId: form.accessKeyId || undefined,
          secretAccessKey: form.secretAccessKey || undefined,
          publicBaseUrl: form.publicBaseUrl,
        }
      : {}),
  });

  async function run(kind: "test" | "save") {
    setWorking(true);
    setResult(null);
    try {
      const response = await adminFetch("/api/admin/console/storage", { action: kind, input: input() });
      if (kind === "save") {
        setStatus(response.status);
        setForm((f) => ({ ...f, accessKeyId: "", secretAccessKey: "" }));
        setResult({ ok: true, message: response.status.provider === "s3" ? "Saved. New images and uploads now go to S3." : "Saved. Files are stored on this server." });
      } else setResult({ ok: true, message: response.message });
    } catch (error) {
      setResult({ ok: false, message: error instanceof Error ? error.message : "Connection failed" });
    } finally {
      setWorking(false);
    }
  }

  if (!status) return <p className="uc-loading">Loading storage settings…</p>;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  return (
    <Panel title="Image and file storage">
      <p>
        Currently storing files {status.provider === "s3" ? <>in <strong>s3://{status.bucket}</strong> ({status.region})</> : <>on <strong>this server</strong></>}.
        Changing storage affects new images and uploads; existing files stay where they are and keep working.
      </p>
      <div className="uc-segmented" role="group" aria-label="Storage provider">
        <button type="button" aria-pressed={form.provider === "local"} onClick={() => setForm({ ...form, provider: "local" })}>
          This server
        </button>
        <button type="button" aria-pressed={form.provider === "s3"} onClick={() => setForm({ ...form, provider: "s3" })}>
          Amazon S3
        </button>
      </div>
      {form.provider === "s3" && (
        <div className="uc-form-grid uc-storage-grid">
          <label>
            Bucket name
            <input value={form.bucket} onChange={set("bucket")} placeholder="netofficials-media" autoComplete="off" />
          </label>
          <label>
            Region
            <select value={form.region} onChange={set("region")}>
              {regions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </label>
          <label>
            Access key ID
            <input value={form.accessKeyId} onChange={set("accessKeyId")} placeholder={status.accessKeyId || "AKIA…"} autoComplete="off" />
            {status.accessKeyId && <small>Saved: {status.accessKeyId}. Leave blank to keep it.</small>}
          </label>
          <label>
            Secret access key
            <input type="password" value={form.secretAccessKey} onChange={set("secretAccessKey")} placeholder={status.hasSecret ? "Saved — leave blank to keep" : ""} autoComplete="new-password" />
            <small>Stored encrypted. Never shown again.</small>
          </label>
          <label>
            Folder prefix
            <input value={form.prefix} onChange={set("prefix")} placeholder="netofficials/" />
          </label>
          <label>
            Public URL / CDN <span className="uc-muted">(optional)</span>
            <input value={form.publicBaseUrl} onChange={set("publicBaseUrl")} placeholder="https://cdn.example.com" />
            <small>When set, published images are served from here (for example CloudFront in front of the bucket).</small>
          </label>
        </div>
      )}
      {form.provider === "s3" && (
        <details>
          <summary>Required IAM permissions</summary>
          <pre>{`s3:ListBucket on arn:aws:s3:::BUCKET
s3:GetObject, s3:PutObject, s3:DeleteObject on arn:aws:s3:::BUCKET/PREFIX*`}</pre>
        </details>
      )}
      {result && (
        <p className={"uc-test-result " + (result.ok ? "ok" : "fail")} role="status">
          {result.ok ? "✓ " : "✕ "}
          {result.message}
        </p>
      )}
      <div className="uc-form-footer">
        {form.provider === "s3" && (
          <button type="button" disabled={working} onClick={() => run("test")}>
            Test connection
          </button>
        )}
        <button type="button" className="uc-primary" disabled={working} onClick={() => run("save")}>
          {working ? "Working…" : "Save storage settings"}
        </button>
      </div>
    </Panel>
  );
}
