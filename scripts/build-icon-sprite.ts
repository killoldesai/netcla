import { writeFile } from "node:fs/promises";
import { iconKeys } from "../src/page-spec-schema";
import { validateSprite } from "../src/production-assets";
const artwork: Record<string, string> = {
  "code-brackets": '<path d="m14 11-9 9 9 9m12-18 9 9-9 9m-4-22-4 26"/>',
  "mobile-device":
    '<rect x="10" y="3" width="20" height="34" rx="4"/><path d="M16 7h8m-8 26h8"/>',
  "brain-circuit":
    '<path d="M20 7c-8-7-15 0-13 7-6 4-3 12 3 13 0 8 8 11 10 5V7Zm0 0c8-7 15 0 13 7 6 4 3 12-3 13 0 8-8 11-10 5V7ZM11 15h5v8h-5m18-8h-5v8h5"/>',
  "cloud-upload":
    '<path d="M10 28a8 8 0 0 1-2-16 12 12 0 0 1 23-1 9 9 0 0 1-1 17M20 36V18m-6 6 6-6 6 6"/>',
  "settings-gear":
    '<path d="m16 4 8 0 2 6 6 1 4 7-4 5 2 6-7 5-6-3-5 4-7-4 1-6-5-4 2-8 6-1Z"/><circle cx="20" cy="20" r="6"/>',
  "layers-stack":
    '<path d="m3 13 17-9 17 9-17 9-17-9Zm0 8 17 9 17-9M3 29l17 9 17-9"/>',
  "shield-check":
    '<path d="m20 3 14 6v12c0 8-7 13-14 16C13 34 6 29 6 21V9l14-6Zm-7 17 5 5 10-11"/>',
  "users-group":
    '<circle cx="20" cy="11" r="6"/><circle cx="7" cy="15" r="4"/><circle cx="33" cy="15" r="4"/><path d="M9 35v-5a11 11 0 0 1 22 0v5H9ZM2 31v-6a6 6 0 0 1 7-6m29 12v-6a6 6 0 0 0-7-6"/>',
  "rocket-launch":
    '<path d="M13 27c0-14 12-22 22-22 0 10-8 22-22 22Zm-1-10H6l-4 12 11-2m10 1v6l-12 4 2-11M7 33l-4 4"/><circle cx="26" cy="14" r="4"/>',
  "chart-bar": '<path d="M4 3v33h32M10 30V21h5v9m5 0V13h5v17m5 0V5h5v25"/>',
  "document-text":
    '<path d="M8 3h17l8 8v26H8V3Zm17 0v9h8M13 19h15m-15 6h15m-15 6h9"/>',
  "api-plug":
    '<path d="M14 4v10m12-10v10M10 14h20v6a10 10 0 0 1-20 0v-6Zm10 16v7M3 18h7m20 0h7"/>',
  "flutter-diamond":
    '<path d="m26 3-21 21 7 7L33 10h-7m-7 20 8-8-7-7-8 8 14 14h11L19 19"/>',
  "react-atom":
    '<ellipse cx="20" cy="20" rx="18" ry="7"/><ellipse cx="20" cy="20" rx="18" ry="7" transform="rotate(60 20 20)"/><ellipse cx="20" cy="20" rx="18" ry="7" transform="rotate(120 20 20)"/><circle cx="20" cy="20" r="3"/>',
  "nodejs-hexagon":
    '<path d="m20 3 15 9v17l-15 9-15-9V12l15-9Zm-8 23V15l16 11V15"/>',
  "python-snake":
    '<path d="M20 4H12a7 7 0 0 0-7 7v8h21V9a5 5 0 0 0-5-5Zm0 32h8a7 7 0 0 0 7-7v-8H14v10a5 5 0 0 0 5 5ZM5 13H3v15h8m24-1h2V12h-8"/><circle cx="14" cy="10" r="1"/><circle cx="26" cy="30" r="1"/>',
  "aws-cloud":
    '<path d="M10 29a8 8 0 0 1-2-16 12 12 0 0 1 23-1 9 9 0 0 1-1 17H10Zm2 5c8 4 15 2 21-2m-4 0 5-1-1 5"/>',
  "kubernetes-wheel":
    '<path d="m20 3 15 8 3 17-12 10H14L2 28l3-17 15-8ZM20 12V5m0 23v9M12 16l-6-4m22 4 6-4M12 24l-7 4m23-4 7 4"/><circle cx="20" cy="20" r="9"/><circle cx="20" cy="20" r="3"/>',
  "docker-whale":
    '<path d="M3 21h25l5-6 5 3-6 7c-3 11-27 14-29-4ZM6 20v-7h7v7m0 0v-7h7v7m0 0v-7h7v7m-7-7V6h7v7"/>',
  "terraform-blocks":
    '<path d="m4 5 10 6v12L4 17V5Zm13 8 10 6v12l-10-6V13Zm13 6 7-4v12l-7 4V19Zm-13 9 10 6v5l-10-6v-5Z"/>',
};
const svg =
  '<svg xmlns="http://www.w3.org/2000/svg">' +
  iconKeys
    .map(
      (key) =>
        '<symbol id="' +
        key +
        '" viewBox="0 0 40 40" fill="none" stroke="#533afd" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' +
        artwork[key] +
        "</symbol>",
    )
    .join("") +
  "</svg>";
await writeFile("public/assets/netofficials-icons.svg", validateSprite(svg));
console.log("Built and validated twenty shared SVG symbols.");
