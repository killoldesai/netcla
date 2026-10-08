export const coreServicePaths = [
  "/custom-software-development",
  "/web-application-development",
  "/web-development",
  "/web-design",
  "/ui-ux-design",
  "/ecommerce-development",
  "/website-redesign",
  "/seo-services",
  "/ppc-services",
  "/software-development-outsourcing",
];
export function coreServiceMode(path: string) {
  return /seo|ppc/.test(path)
    ? "search"
    : /design/.test(path)
      ? "design"
      : /ecommerce/.test(path)
        ? "commerce"
        : "build";
}
