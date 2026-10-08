"use client";
import { useState } from "react";
import { adminReturn, legacyAdminReturn } from "./admin-return";
export function Login() {
  const [error, setError] = useState(""),
    [invalid, setInvalid] = useState(false),
    [showPassword, setShowPassword] = useState(false),
    [signingIn, setSigningIn] = useState(false),
    [capsLock, setCapsLock] = useState(false);
  return (
    <form
      className="owner-login-form"
      aria-busy={signingIn}
      onSubmit={async (e) => {
        e.preventDefault();
        if (signingIn) return;
        const fields = Object.fromEntries(new FormData(e.currentTarget));
        setSigningIn(true);
        setError("");
        setInvalid(false);
        let signedIn = false;
        try {
          const r = await fetch("/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(fields),
          });
          if (r.ok) {
            signedIn = true;
            const requested = new URLSearchParams(location.search).get("next");
            location.assign(
              location.hash
                ? legacyAdminReturn(location.hash)
                : adminReturn(requested),
            );
            return;
          }
          const result = await r.json().catch(() => ({}));
          setInvalid(r.status === 401);
          setError(
            r.status === 401
              ? "The email or password is incorrect."
              : r.status === 429
                ? "Too many sign-in attempts. Please try again later."
                : result.error || "Sign in is unavailable. Please try again.",
          );
        } catch {
          setError("Unable to connect. Check your connection and try again.");
        } finally {
          if (!signedIn) setSigningIn(false);
        }
      }}
    >
      {error && (
        <div className="login-error" id="login-error" role="alert">
          {error}
        </div>
      )}
      <div className="login-field">
        <label htmlFor="owner-email">Email address</label>
        <input
          id="owner-email"
          name="email"
          type="email"
          required
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="name@company.com"
          disabled={signingIn}
          aria-invalid={invalid || undefined}
          aria-describedby={error ? "login-error" : undefined}
        />
      </div>
      <div className="login-field">
        <label htmlFor="owner-password">Password</label>
        <div className="login-password">
          <input
            id="owner-password"
            name="password"
            type={showPassword ? "text" : "password"}
            required
            autoComplete="current-password"
            disabled={signingIn}
            aria-invalid={invalid || undefined}
            aria-describedby={
              capsLock
                ? "password-caps-lock"
                : error
                  ? "login-error"
                  : undefined
            }
            onKeyUp={(e) => setCapsLock(e.getModifierState("CapsLock"))}
            onKeyDown={(e) => setCapsLock(e.getModifierState("CapsLock"))}
            onBlur={() => setCapsLock(false)}
          />
          <button
            type="button"
            className="login-password-toggle"
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-controls="owner-password"
            aria-pressed={showPassword}
            disabled={signingIn}
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>
        {capsLock && (
          <p id="password-caps-lock" className="login-help" role="status">
            Caps Lock is on.
          </p>
        )}
      </div>
      <button className="login-submit" type="submit" disabled={signingIn}>
        {signingIn ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
