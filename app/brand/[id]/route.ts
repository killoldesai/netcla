import { brandMarks } from "@/brand-marks.generated";

// Brand logos as standalone SVG files (cached for a year; regenerate with npm run icons:brands).
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const id = (await params).id.replace(/\.svg$/, "");
  const mark = /^[a-z0-9-]+$/.test(id) ? brandMarks[id] : undefined;
  if (!mark) return new Response(null, { status: 404 });
  const hex = mark.c ?? "0f1420";
  // Very light brand colours (e.g. JavaScript yellow) get a dark mark for contrast on light chips.
  const light = parseInt(hex.slice(0, 2), 16) * 0.299 + parseInt(hex.slice(2, 4), 16) * 0.587 + parseInt(hex.slice(4, 6), 16) * 0.114 > 200;
  const body = mark.m
    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.v}">${mark.m}</svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mark.v}"><title>${mark.t}</title><path fill="#${light ? "0f1420" : hex}" d="${mark.p}"/></svg>`;
  return new Response(body, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
