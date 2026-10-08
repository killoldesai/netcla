"use client";
import { useState } from "react";
import type { ModelChoice } from "./model-catalog";
import { CredentialSettings } from "./credential-settings";
export function AISettings({
  saved,
  lastTest,
  configured,
  refresh,
}: {
  saved?: { provider: string; model: string };
  lastTest?: any;
  configured: Record<string, boolean>;
  refresh: () => Promise<void>;
}) {
  const [provider, setProvider] = useState(saved?.provider ?? "openrouter"),
    [model, setModel] = useState(saved?.model ?? ""),
    [models, setModels] = useState<ModelChoice[]>([]),
    [search, setSearch] = useState(""),
    [operation, setOperation] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [tested, setTested] = useState<any>(lastTest);
  const matches = models.filter((m) =>
    (m.id + " " + m.name).toLowerCase().includes(search.toLowerCase()),
  );
  const selected = models.find((m) => m.id === model);
  const isSaved = saved?.provider === provider && saved?.model === model.trim();
  const testMatches =
    tested?.provider === provider && tested?.model === model.trim();
  async function request(action: string) {
    setOperation(action);
    setError("");
    setMessage("");
    try {
      const r =
        action === "catalog"
          ? await fetch("/api/admin?type=ai-models&provider=" + provider)
          : await fetch("/api/admin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(
                action === "test-provider"
                  ? { action, provider, model: model.trim() }
                  : {
                      action: "settings",
                      value: { provider, model: model.trim() },
                    },
              ),
            });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error ?? "Request failed");
      if (action === "catalog") {
        setModels(data.models);
        setMessage(
          data.warnings.length
            ? data.warnings.join(" ")
            : data.models.length + " models loaded. Choose one below.",
        );
      }
      if (action === "test-provider") {
        setTested(data.test);
        setMessage(
          "Test passed. The selected model returned valid JSON. Save it below to use it for content generation.",
        );
      }
      if (action === "settings") {
        await refresh();
        setMessage("Saved as your default content-generation model.");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      if (action === "test-provider") setTested(null);
    } finally {
      setOperation("");
    }
  }
  return (
    <section className="admin-settings-card ai-settings">
      <span className="admin-section-label">CONTENT GENERATION</span>
      <h2>Choose your AI model</h2>
      <p>
        Choose a provider, select or enter a model, test its response and save
        your preferred default.
      </p>
      <div className="ai-saved-model">
        <span>Saved default</span>
        <strong>
          {saved
            ? saved.provider === "bedrock"
              ? "AWS Bedrock"
              : "OpenRouter"
            : "No default selected"}
        </strong>
        {saved && <code>{saved.model}</code>}
      </div>
      <label>
        AI provider
        <select
          aria-label="AI provider"
          value={provider}
          disabled={!!operation}
          onChange={(e) => {
            setProvider(e.target.value);
            setModel("");
            setModels([]);
            setSearch("");
            setMessage("");
            setError("");
          }}
        >
          <option value="openrouter">OpenRouter</option>
          <option value="bedrock">AWS Bedrock</option>
        </select>
      </label>
      <p
        className={
          "ai-config-state " + (configured[provider] ? "available" : "missing")
        }
      >
        {configured[provider]
          ? "Provider credentials saved · test to verify access"
          : "Provider credentials not configured"}
      </p>
      <CredentialSettings
        key={provider}
        provider={provider}
        configured={configured[provider]}
        onSaved={async () => {
          setTested(null);
          setModels([]);
          setMessage("");
          setError("");
          await refresh();
        }}
      />
      <button
        className="secondary-button"
        disabled={!!operation}
        onClick={() => request("catalog")}
      >
        {operation === "catalog"
          ? "Loading model catalog…"
          : "Load available models"}
      </button>
      {!!models.length && (
        <>
          <label>
            Find a model
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name or model ID"
            />
          </label>
          <label>
            Available models
            <select
              aria-label="Available models"
              value={models.some((m) => m.id === model) ? model : ""}
              disabled={!!operation}
              onChange={(e) => {
                setModel(e.target.value);
                setMessage("");
                setError("");
              }}
            >
              <option value="">Choose a model</option>
              {matches.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} · {m.kind}
                </option>
              ))}
            </select>
          </label>
          <small>
            {matches.length} matching models. Catalog availability does not
            confirm invocation access.
          </small>
        </>
      )}
      <label>
        Selected model or inference profile ID
        <input
          value={model}
          disabled={!!operation}
          onChange={(e) => {
            setModel(e.target.value);
            setMessage("");
            setError("");
          }}
          placeholder={
            provider === "bedrock"
              ? "Enter a model ID or inference profile ID"
              : "provider/model-id"
          }
        />
      </label>
      <p>
        Exact IDs can also be entered manually when catalog access is
        unavailable.
      </p>
      {selected && (selected.context || selected.outputLimit) && (
        <div className="ai-model-specs">
          {selected.context && (
            <span>Context: {selected.context.toLocaleString()} tokens</span>
          )}
          {selected.outputLimit && (
            <span>
              Max output: {selected.outputLimit.toLocaleString()} tokens
            </span>
          )}
        </div>
      )}
      <div className="ai-test-state">
        <strong>
          {testMatches
            ? "Selected model tested successfully"
            : "Selected model has not passed a test"}
        </strong>
        {testMatches && (
          <small>
            {new Date(tested.testedAt).toLocaleString()} · {tested.elapsedMs} ms
          </small>
        )}
        <p>
          The test sends a small JSON request. It checks access and response
          format; longer content jobs also depend on token limits. Provider
          usage charges may apply.
        </p>
        <button
          disabled={!!operation || !model.trim() || !configured[provider]}
          onClick={() => request("test-provider")}
        >
          {operation === "test-provider"
            ? "Testing model…"
            : "Test selected model"}
        </button>
      </div>
      {error && (
        <p role="alert" className="editor-issue">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="ai-settings-message">
          {message}
        </p>
      )}
      <button
        disabled={!!operation || !model.trim() || isSaved}
        onClick={() => request("settings")}
      >
        {operation === "settings"
          ? "Saving…"
          : isSaved
            ? "Saved for content generation"
            : "Save for content generation"}
      </button>
      <p>
        Saving changes future generation jobs. Already queued jobs retain their
        selected model. Provider credentials are managed here and encrypted in
        the database.
      </p>
    </section>
  );
}
