import { query } from "@/db";
import { notFound } from "next/navigation";
import { CareerApplicationForm } from "@/career-application-form";
import { StripeNavigation, StripeFooter } from "@/stripe-home-chrome";
import type { Metadata } from "next";
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
  return (
    <div className="v3-site">
      <link rel="stylesheet" href="/assets/stripe-home.css" />
      <link rel="stylesheet" href="/assets/brand-home.css" />
      <StripeNavigation paths={paths} />
      <main className="v3-site">
        <link rel="stylesheet" href="/assets/v3-pages.css" />
        <section className="v3-section">
          <div className="v3-wrap">
            <a href="/careers">← All openings</a>
            <h1>{vacancy.title}</h1>
            <p>
              {vacancy.department} · {vacancy.location} ·{" "}
              {vacancy.employment_type}
            </p>
            <p style={{ whiteSpace: "pre-line" }}>{vacancy.description}</p>
            <CareerApplicationForm id={vacancy.id} title={vacancy.title} />
          </div>
        </section>
      </main>
      <StripeFooter paths={paths} />
    </div>
  );
}
