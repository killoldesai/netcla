import { query } from "@/db";
import { notFound } from "next/navigation";
import { CareerApplicationForm } from "@/career-application-form";
import { V2Shell } from "@/site/v2/shell";
import { V2Crumbs, V2Icon, V2Img } from "@/site/v2/ui";
import type { Metadata } from "next";

// Role detail, redesigned from html-prototype/v2/career-role.html. Styles: public/assets/v2/pages/career-role.css.
// The application form is the real CareerApplicationForm; its logic, fields, validation and honeypot are unchanged.

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const [vacancy] = await query(
    "SELECT title,description FROM vacancies WHERE slug=$1 AND status='open' AND verified=true",
    [slug],
  );
  return vacancy
    ? {
        title: vacancy.title + " | Netofficials Careers",
        description: vacancy.description.slice(0, 160),
        alternates: { canonical: "/careers/" + slug },
      }
    : { robots: { index: false, follow: false } };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [vacancy] = await query(
    "SELECT * FROM vacancies WHERE slug=$1 AND status='open' AND verified=true",
    [slug],
  );
  if (!vacancy) notFound();
  const paths = (
    await query(
      "SELECT path FROM pages WHERE published_revision_id IS NOT NULL",
    )
  ).map((p) => p.path);
  const details: { label: string; value: string }[] = [
    { label: "Location", value: vacancy.location },
    { label: "Type", value: vacancy.employment_type },
    { label: "Team", value: vacancy.department },
  ].filter((d): d is { label: string; value: string } => !!d.value);
  const badges = [vacancy.location, vacancy.employment_type, vacancy.department].filter(Boolean) as string[];
  return (
    <V2Shell page="career-role" paths={paths}>
      <section className="hero--center role-hero">
        <div className="wrap">
          <V2Crumbs trail={[{ label: "Home", href: "/" }, { label: "Careers", href: "/careers" }, { label: vacancy.title }]} />
          <p className="eyebrow">
            <V2Img name="ic-team" />
            Open role
          </p>
          <h1>{vacancy.title}</h1>
          {badges.length > 0 && (
            <div className="skills role-facts">
              {badges.map((badge) => (
                <span key={badge}>{badge}</span>
              ))}
            </div>
          )}
          <div className="hero__acts">
            <a className="btn btn--grad" href="#apply">
              Apply for this role <V2Icon name="arrow" />
            </a>
            <a className="btn btn--ghost" href="/careers">
              All open roles
            </a>
          </div>
        </div>
      </section>

      <section className="sec" id="overview" aria-label="About the role">
        <div className="wrap split role-split">
          <div className="prose rv">
            <h2>About the role</h2>
            <p className="role-text">{vacancy.description}</p>
          </div>

          <aside className="frame role-summary rv" aria-labelledby="role-summary-title">
            <h2 className="h3" id="role-summary-title">
              Role summary
            </h2>
            {details.length > 0 && (
              <dl>
                {details.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <a className="btn btn--grad" href="#apply">
              Apply for this role <V2Icon name="arrow" />
            </a>
          </aside>
        </div>
      </section>

      <section className="sec sec--cloud" id="apply" aria-labelledby="apply-t">
        <div className="wrap split role-apply">
          <div className="rv">
            <p className="eyebrow">Apply</p>
            <h2 className="h2" id="apply-t">
              Apply for this role
            </h2>
          </div>
          <div className="role-form rv">
            <CareerApplicationForm id={vacancy.id} title={vacancy.title} />
          </div>
        </div>
      </section>
    </V2Shell>
  );
}
