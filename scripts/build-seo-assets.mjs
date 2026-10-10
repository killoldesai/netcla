// Builds the SEO image assets: favicons from design-source/favicon-source.png, and a lightweight header logo
// plus the default share image from design-source/logo-master.png.
import sharp from "sharp";
import fs from "node:fs";

const white = "#ffffff";
const fav = (size, pad = 0) =>
  sharp("design-source/favicon-source.png")
    .resize(size - pad * 2, size - pad * 2)
    .extend({ top: pad, bottom: pad, left: pad, right: pad, background: white })
    .png({ compressionLevel: 9 })
    .toBuffer();

fs.writeFileSync("app/icon.png", await fav(512));
fs.writeFileSync("app/apple-icon.png", await fav(180, 12));
fs.writeFileSync("public/assets/logo-square.png", await fav(512));

// favicon.ico: PNG images embedded at 16, 32 and 48 px.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((s) => fav(s)));
const header = Buffer.alloc(6);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const entries = sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e[0] = s;
  e[1] = s;
  e.writeUInt16LE(1, 4);
  e.writeUInt16LE(32, 6);
  e.writeUInt32LE(images[i].length, 8);
  e.writeUInt32LE(offset, 12);
  offset += images[i].length;
  return e;
});
fs.writeFileSync("app/favicon.ico", Buffer.concat([header, ...entries, ...images]));

const master = fs.readFileSync("design-source/logo-master.png");
fs.writeFileSync("public/assets/logo.png", await sharp(master).resize({ width: 672 }).png({ compressionLevel: 9, palette: true }).toBuffer());
const logo = await sharp(master).resize({ width: 880 }).png().toBuffer();
fs.writeFileSync(
  "public/assets/og-default.png",
  await sharp({ create: { width: 1200, height: 630, channels: 3, background: white } })
    .composite([{ input: logo, gravity: "center" }])
    .png({ compressionLevel: 9 })
    .toBuffer(),
);
console.log("seo assets built");
