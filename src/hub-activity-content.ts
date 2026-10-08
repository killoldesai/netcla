import type { ActivityPanelContent, ActivityRow } from "./hub-activity-panel";
const row = (
  icon: ActivityRow["icon"],
  title: string,
  subtitle: string,
  status: string,
  tone?: ActivityRow["tone"],
): ActivityRow => ({ icon, title, subtitle, status, tone });
export const hubActivityContent: Record<string, ActivityPanelContent> = {
  "/mobile-app-development": {
    metrics: [
      { value: "iOS + Android", label: "Platforms" },
      { value: "Flutter", label: "Shared codebase" },
      { value: "API", label: "Backend connections" },
    ],
    rows: [
      row(
        "phone",
        "Flutter build complete",
        "Development build",
        "Ready",
        "ready",
      ),
      row(
        "check",
        "App Store checklist",
        "Release preparation",
        "Review",
        "review",
      ),
      row("code", "Feature branch merged", "Code review complete", "Merged"),
      row("cloud", "Backend API deployed", "Test environment", "Staging"),
    ],
    technologies: ["Flutter", "React Native", "Swift"],
  },
  "/custom-software-development": {
    metrics: [
      { value: "Web apps", label: "Products" },
      { value: "Sprint", label: "Delivery approach" },
      { value: "API", label: "Integrations" },
    ],
    rows: [
      row(
        "code",
        "Application build complete",
        "Development branch",
        "Ready",
        "ready",
      ),
      row(
        "check",
        "Workflow checks",
        "Acceptance criteria",
        "Review",
        "review",
      ),
      row(
        "code",
        "Integration changes merged",
        "Code review complete",
        "Merged",
      ),
      row("cloud", "Application deployed", "Test environment", "Staging"),
    ],
    technologies: ["React", "Node.js", "PostgreSQL"],
  },
  "/ai-development-services": {
    metrics: [
      { value: "LLM", label: "Language workflows" },
      { value: "ML", label: "Model development" },
      { value: "API", label: "Integration approach" },
    ],
    rows: [
      row(
        "code",
        "Assistant integration built",
        "Test dataset",
        "Ready",
        "ready",
      ),
      row("check", "Response evaluation", "Quality checks", "Review", "review"),
      row(
        "code",
        "Automation changes merged",
        "Workflow integration",
        "Merged",
      ),
      row("cloud", "Model endpoint deployed", "Test environment", "Staging"),
    ],
    technologies: ["Python", "TensorFlow", "APIs"],
  },
  "/cloud-services": {
    metrics: [
      { value: "Cloud", label: "Infrastructure" },
      { value: "CI/CD", label: "Delivery pipelines" },
      { value: "IaC", label: "Approach" },
    ],
    rows: [
      row(
        "cloud",
        "Infrastructure plan created",
        "Environment configuration",
        "Ready",
        "ready",
      ),
      row(
        "check",
        "Deployment checks",
        "Access and configuration",
        "Review",
        "review",
      ),
      row(
        "code",
        "Pipeline changes merged",
        "Version-controlled setup",
        "Merged",
      ),
      row(
        "cloud",
        "Test environment deployed",
        "Infrastructure validation",
        "Staging",
      ),
    ],
    technologies: ["AWS", "Azure", "Terraform"],
  },
  "/web-development": {
    metrics: [
      { value: "Web", label: "Experience" },
      { value: "UI/UX", label: "Design" },
      { value: "CMS", label: "Content" },
    ],
    rows: [
      row("code", "Page build complete", "Responsive layout", "Ready", "ready"),
      row(
        "check",
        "Content and form checks",
        "Pre-release review",
        "Review",
        "review",
      ),
      row("code", "Template changes merged", "Code review complete", "Merged"),
      row("cloud", "Website preview deployed", "Test environment", "Staging"),
    ],
    technologies: ["Next.js", "WordPress", "Shopify"],
  },
  "/seo-services": {
    metrics: [
      { value: "Crawl", label: "Technical review" },
      { value: "Content", label: "On-page work" },
      { value: "Search", label: "Reporting" },
    ],
    rows: [
      row(
        "code",
        "Crawl review complete",
        "Website structure",
        "Ready",
        "ready",
      ),
      row(
        "check",
        "Page recommendations",
        "Content and metadata",
        "Review",
        "review",
      ),
      row(
        "code",
        "Schema changes prepared",
        "Implementation checks",
        "Prepared",
      ),
      row("cloud", "Search report updated", "Reporting workspace", "Example"),
    ],
    technologies: ["Search Console", "Analytics", "Schema"],
  },
  "/ppc-services": {
    metrics: [
      { value: "Ads", label: "Campaigns" },
      { value: "Goals", label: "Conversion tracking" },
      { value: "Review", label: "Reporting" },
    ],
    rows: [
      row(
        "code",
        "Campaign draft prepared",
        "Keywords and ad groups",
        "Ready",
        "ready",
      ),
      row("check", "Conversion checks", "Enquiry tracking", "Review", "review"),
      row(
        "code",
        "Landing page reviewed",
        "Message and form checks",
        "Prepared",
      ),
      row("cloud", "Campaign report updated", "Reporting workspace", "Example"),
    ],
    technologies: ["Google Ads", "Analytics", "Tag Manager"],
  },
};
