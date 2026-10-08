"use client";
import { useState } from "react";
export function CredentialSettings({
  provider,
  configured,
  onSaved,
}: {
  provider: string;
  configured: boolean;
  onSaved: () => Promise<void>;
}) {
  const [apiKey, setApiKey] = useState(""),
    [accessKeyId, setAccessKeyId] = useState(""),
    [secretAccessKey, setSecretAccessKey] = useState(""),
    [sessionToken, setSessionToken] = useState(""),
    [region, setRegion] = useState("us-east-1"),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState(""),
    [error, setError] = useState("");
  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setError("");
    try {
      const value =
        provider === "bedrock"
          ? { provider, region, accessKeyId, secretAccessKey, sessionToken }
          : { provider, apiKey };
      const response = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "provider-credentials", value }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error ?? "Credentials could not be saved");
      setApiKey("");
      setAccessKeyId("");
      setSecretAccessKey("");
      setSessionToken("");
      await onSaved();
      setMessage(
        "Credentials saved securely. Load models and test your selection below.",
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={save} className="ai-test-state">
      <strong>
        {provider === "bedrock" ? "AWS credentials" : "OpenRouter API key"}
      </strong>
      <p>
        {configured
          ? "Credentials are saved. Enter new credentials to replace them."
          : "Add credentials to enable model testing and content generation."}{" "}
        Saved keys are encrypted and never displayed.
      </p>
      {provider === "bedrock" ? (
        <>
          <label>
            AWS region
            <input
              required
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              placeholder="us-east-1"
              disabled={busy}
            />
          </label>
          <label>
            AWS access key ID
            <input
              type="password"
              autoComplete="new-password"
              required
              value={accessKeyId}
              onChange={(e) => setAccessKeyId(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            AWS secret access key
            <input
              type="password"
              autoComplete="new-password"
              required
              value={secretAccessKey}
              onChange={(e) => setSecretAccessKey(e.target.value)}
              disabled={busy}
            />
          </label>
          <label>
            AWS session token (optional)
            <input
              type="password"
              autoComplete="new-password"
              value={sessionToken}
              onChange={(e) => setSessionToken(e.target.value)}
              disabled={busy}
            />
          </label>
        </>
      ) : (
        <label>
          OpenRouter API key
          <input
            type="password"
            autoComplete="new-password"
            required
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={busy}
          />
        </label>
      )}
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
      <button type="submit" disabled={busy}>
        {busy
          ? "Saving credentials…"
          : configured
            ? "Replace credentials"
            : "Save credentials"}
      </button>
    </form>
  );
}
