import { Login } from "@/admin-login";
export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};
export default function Page() {
  return (
    <main className="admin-login-shell">
      <section className="admin owner-login" aria-labelledby="login-title">
        <a href="/" className="login-brand" aria-label="Netofficials website">
          <img
            src="/assets/logo.png"
            alt="Netofficials"
            className="owner-login-logo"
          />
        </a>
        <div className="login-heading">
          <span>Administration</span>
          <h1 id="login-title">Sign in to admin</h1>
          <p>Enter your admin email and password.</p>
        </div>
        <Login />
        <div className="login-footer">
          <a href="/">Back to website</a>
        </div>
      </section>
    </main>
  );
}
