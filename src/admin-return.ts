export function adminReturn(value: string | null | undefined) {
  if (
    !value ||
    !/^\/admin(?:\/[a-z0-9/-]+)?(?:\?[^#]*)?$/.test(value) ||
    value.startsWith("/admin/login") ||
    /[\\\r\n]/.test(value)
  )
    return "/admin";
  return value;
}
export function legacyAdminReturn(hash: string) {
  const [name, query = ""] = hash.replace(/^#/, "").split("?");
  const routes: Record<string, string> = {
    content: "/admin/pages",
    "site-plan": "/admin/pages",
    generation: "/admin/production",
    publishing: "/admin/production",
    research: "/admin/pages?view=evidence",
    leads: "/admin/leads",
    settings: "/admin/settings",
    dashboard: "/admin",
  };
  const route = routes[name] ?? "/admin";
  const page=new URLSearchParams(query).get('page');
  if(name==='content'&&page&&/^[a-f0-9-]{36}$/i.test(page))return '/admin/pages/'+page.toLowerCase();
  return adminReturn(
    route + (query ? (route.includes("?") ? "&" : "?") + query : ""),
  );
}
