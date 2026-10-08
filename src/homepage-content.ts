import type { Content, Design } from "./content";

// Older homepage revisions keep their slot identities; newly added slots get defaults.
export function homepageContent(design: Design, saved: Content): Content {
  if (saved.schemaVersion === 3) return saved;
  return {
    ...saved,
    schemaVersion: 1,
    sections: undefined,
    texts: Object.fromEntries(
      Object.entries(design.texts).map(([slot, fallback]) => [
        slot,
        saved.texts[slot]?.trim() ? saved.texts[slot] : fallback,
      ]),
    ),
  };
}
