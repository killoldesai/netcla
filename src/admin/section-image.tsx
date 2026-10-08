"use client";
import { useState } from "react";
import { adminFetch } from "../admin-console";
import { mediaPath } from "../media-path";
import type { PageSection } from "../page-spec-schema";

type Asset = NonNullable<PageSection["asset"]>;

/**
 * WordPress-style image box for one section: preview, alt text and caption,
 * plus regenerate (AI), replace (upload), accept and remove.
 */
export function SectionImage({
  section,
  path,
  baseRevisionId,
  dirty,
  busy,
  generating,
  action,
  onChange,
}: {
  section: PageSection;
  path: string;
  baseRevisionId: string;
  dirty: boolean;
  busy: boolean;
  generating: boolean;
  action: (path: string, body: unknown, success?: string) => Promise<boolean>;
  onChange: (asset: Asset | undefined) => void;
}) {
  const asset = section.asset;
  const [mode, setMode] = useState<"idle" | "regenerate" | "upload">("idle");
  const [instruction, setInstruction] = useState("");
  const [alt, setAlt] = useState("");
  const [status, setStatus] = useState("");

  async function regenerate() {
    const settings = await adminFetch("/api/admin/console/settings");
    const d = settings.values?.generation_defaults ?? {};
    const ok = await action(
      "/api/admin/publishing",
      {
        action: "queue",
        input: {
          paths: [path],
          provider: d.provider,
          model: d.model,
          imageModel: d.imageModel,
          imageQuality: d.imageQuality ?? "medium",
          scope: "image",
          sectionIds: [section.id],
          baseRevisionId,
          ...(instruction.trim() ? { instruction: instruction.trim() } : {}),
        },
      },
      "New image queued. It appears here when ready; your text is unchanged.",
    );
    if (ok) {
      setMode("idle");
      setInstruction("");
    }
  }

  async function upload(file: File) {
    setStatus("Uploading…");
    const form = new FormData();
    form.set("file", file);
    form.set("alt", alt);
    try {
      const response = await fetch("/api/admin/media/upload", { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Upload failed");
      onChange(result.asset);
      setStatus("Uploaded. Save the draft to keep it.");
      setMode("idle");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed");
    }
  }

  return (
    <div className="uc-image-box">
      <div className="uc-image-box-head">
        <strong>Section image</strong>
        {generating && <span className="uc-loz uc-loz-progress">Generating…</span>}
      </div>
      {asset ? (
        <div className="uc-image-box-body">
          <a href={mediaPath(asset)} target="_blank" rel="noreferrer" className="uc-image-thumb">
            <img src={mediaPath(asset)} alt={asset.alt} />
          </a>
          <div className="uc-image-meta">
            <label>
              Alt text
              <input
                value={asset.alt}
                maxLength={300}
                onChange={(e) => onChange({ ...asset, alt: e.target.value })}
              />
              <small>{asset.alt.length}/125 recommended</small>
            </label>
            <label>
              Caption <span className="uc-muted">(optional, shown under inline images)</span>
              <input value={asset.caption ?? ""} maxLength={200} onChange={(e) => onChange({ ...asset, caption: e.target.value || undefined })} />
            </label>
            <p className="uc-image-file">
              {asset.name ? `${asset.name}.webp` : "image.webp"} · {asset.width} × {asset.height} · WebP
            </p>
            <div className="uc-row-actions">
              <button type="button" disabled={busy || dirty || generating} title={dirty ? "Save your edits first" : undefined} onClick={() => setMode(mode === "regenerate" ? "idle" : "regenerate")}>
                Regenerate with AI
              </button>
              <button type="button" disabled={busy} onClick={() => setMode(mode === "upload" ? "idle" : "upload")}>
                Replace
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => action("/api/admin/publishing", { action: "asset-review", id: asset.id, status: "accepted" }, "Image accepted")}
              >
                Accept
              </button>
              {section.id !== "hero" && (
                <button type="button" className="uc-text-button" onClick={() => confirm("Remove this image from the section?") && onChange(undefined)}>
                  Remove
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="uc-image-empty">
          <p>No image on this section.</p>
          <div className="uc-row-actions">
            <button type="button" disabled={busy || dirty || generating} onClick={() => setMode("regenerate")}>
              Generate with AI
            </button>
            <button type="button" disabled={busy} onClick={() => setMode("upload")}>
              Upload
            </button>
          </div>
        </div>
      )}
      {mode === "regenerate" && (
        <div className="uc-image-panel">
          <label>
            What should change? <span className="uc-muted">(optional)</span>
            <textarea
              rows={2}
              maxLength={600}
              value={instruction}
              placeholder="For example: show the data flow between the mobile app and the ERP system."
              onChange={(e) => setInstruction(e.target.value)}
            />
          </label>
          <p className="uc-muted">A new brief is written from this section's current copy, so the picture matches what the section says.</p>
          <div className="uc-row-actions">
            <button type="button" className="uc-primary" disabled={busy} onClick={regenerate}>
              Generate new image
            </button>
            <button type="button" onClick={() => setMode("idle")}>Cancel</button>
          </div>
        </div>
      )}
      {mode === "upload" && (
        <div className="uc-image-panel">
          <label>
            Alt text (required)
            <input value={alt} maxLength={300} placeholder="Describe what the image shows" onChange={(e) => setAlt(e.target.value)} />
          </label>
          <label>
            Image file (PNG, JPEG or WebP, up to 8 MB; saved as WebP)
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp"
              disabled={alt.trim().length < 10}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) upload(file);
                e.target.value = "";
              }}
            />
          </label>
          {alt.trim().length < 10 && <small>Write the alt text first (at least 10 characters).</small>}
        </div>
      )}
      {status && <p role="status" className="uc-muted">{status}</p>}
    </div>
  );
}
