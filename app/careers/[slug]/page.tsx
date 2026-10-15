import { query } from "@/db";
import { notFound } from "next/navigation";
import { CareerApplicationForm } from "@/career-application-form";
import { NxShell } from "@/site/shell";
import { ArrowLink, Breadcrumbs, Button, HeroArt, SectionHead } from "@/site/ui";
import { CareerRoleArt } from "@/site/art/career-role-art";
import type { Metadata } from "next";

// Role detail, redesigned from html-prototype/career-role.html. Styles: public/assets/nx/pages/career-role.css.
// The application form is the real CareerApplicationForm; its logic and fields are unchanged.

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
    <NxShell page="career-role" paths={paths}>
      <section className="page-hero">
        <div className="container">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Careers", href: "/careers" }, { label: vacancy.title }]} />
          <div className="hero__grid">
            <div>
              <span className="tag-pill">Open role</span>
              <h1>{vacancy.title}</h1>
              {badges.length > 0 && (
                <div className="role-badges">
                  {badges.map((badge, i) => (
                    <span key={badge} className={"nx-badge" + (i === 1 ? " nx-badge--lime" : "")}>
                      <span className="nx-badge__dot" aria-hidden="true" />
                      {badge}
                    </span>
                  ))}
                </div>
              )}
              <div className="hero__actions">
                <Button href="#apply" size="lg">Apply for this role</Button>
                <ArrowLink href="/careers">All open roles</ArrowLink>
              </div>
            </div>
            <HeroArt fallback={<CareerRoleArt />} priority />
          </div>
        </div>
      </section>

      <section className="section" id="overview">
        <div className="container role-grid">
          <div className="role-main nx-reveal">
            <h2 className="h-section">About the role</h2>
            <p className="role-text">{vacancy.description}</p>
          </div>

          <aside className="role-summary nx-reveal" aria-labelledby="role-summary-title">
            <h2 className="role-summary__title" id="role-summary-title">Role summary</h2>
            {details.length > 0 && (
              <dl className="role-summary__list">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{d.value}</dd>
                  </div>
                ))}
              </dl>
            )}
            <Button href="#apply" size="lg" className="role-summary__apply">Apply for this role</Button>
          </aside>
        </div>
      </section>

      <section className="section section--white" id="apply">
        <div className="container role-apply">
          <div className="role-apply__intro nx-reveal">
            <SectionHead eyebrow="Apply" title="Apply for this role" />
          </div>
          <div className="role-form nx-reveal">
            <CareerApplicationForm id={vacancy.id} title={vacancy.title} />
          </div>
        </div>
      </section>
    </NxShell>
  );
}
