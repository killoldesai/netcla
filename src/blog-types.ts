// Shared by the server query (blog-posts.ts) and the renderer (blog-index-page.tsx), which must stay client-safe.
export type BlogPost = {
  path: string;
  title: string;
  tag: string;
  description: string;
  readMinutes: number;
  date?: string;
  image?: { id: string; alt: string; width?: number; height?: number };
};
