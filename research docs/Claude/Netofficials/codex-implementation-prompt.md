# Netofficials — Full Site Implementation Prompt
**Send this to Codex/Cursor with all 4 attached files.**

---

## Attached Files Reference
| File | Purpose |
|---|---|
| `core-service-sections.csv` | 550 rows — 50 core service pages × 11 rows (1 blueprint + 10 sections) |
| `hub-and-static-sections.csv` | 128 rows — 17 hub/static pages × rows (1 blueprint + sections) |
| `generation-pipeline-prompts.docx` | Full pipeline reference: system prompts, API calls, column guide |
| `master-icon-prompt.txt` | 20-icon SVG sprite prompt + icon key reference table |

---

## Tech Stack
- **Framework:** Next.js 14+ (App Router)
- **Database:** PostgreSQL via Prisma ORM
- **Styling:** Tailwind CSS
- **Admin:** Existing admin panel (extend, do not rebuild)
- **AI:** OpenRouter API (text + image generation)

---

## ⚠️ ALERTS — Read Before Starting

1. **Do not delete or break any existing pages** outside of `/` (homepage). Only replace the homepage.
2. **Do not remove existing admin routes** — only add new ones.
3. **Ask me before touching** any authentication, payment, or third-party integration code.
4. **The CSV files are the source of truth** for page structure — do not invent sections or fields not present in them.
5. **All design tokens are specified below** — do not use Tailwind defaults for brand colours; use CSS variables or the exact hex values listed.

---

## Design System Tokens
Use these exact values everywhere. Define as CSS custom properties in `globals.css`.

```css
:root {
  --color-indigo:   #533afd;  /* primary brand */
  --color-midnight: #061b31;  /* dark text + dark sections */
  --color-frost:    #e5edf5;  /* dividers, borders */
  --color-mist:     #f8fafd;  /* page background, alt sections */
  --color-slate:    #334155;  /* body text */
  --color-gray:     #64748b;  /* secondary text */
  --color-white:    #ffffff;

  --font-primary: 'Inter Tight', system-ui, sans-serif;
  --font-weight-light:   300;
  --font-weight-regular: 400;

  --radius:         4px;
  --max-width:      1320px;
  --section-gap:    96px;
  --divider:        1px solid var(--color-frost);

  /* No box shadows anywhere on the site */
}
```

**Typography scale:**
| Token | Size | Weight | Use |
|---|---|---|---|
| `--text-hero` | 56px / 3.5rem | 300 | H1 hero headings |
| `--text-h1` | 48px / 3rem | 300 | Page H1 |
| `--text-h2` | 40px / 2.5rem | 300 | Section headings |
| `--text-h3` | 32px / 2rem | 400 | Card headings |
| `--text-body-lg` | 20px / 1.25rem | 400 | Subheadlines |
| `--text-body` | 16px / 1rem | 400 | Body copy |
| `--text-sm` | 14px / 0.875rem | 400 | Labels, captions |
| `--text-xs` | 12px / 0.75rem | 400 | Tags, pills |

---

## TASK 1 — Database Schema (Prisma)

Add the following models to `prisma/schema.prisma`. **Do not drop existing tables.**

```prisma
model SitePage {
  id               String   @id @default(cuid())
  pageId           String   @unique  // from CSV: page_id column e.g. "P001"
  url              String   @unique
  cluster          String?
  pageType         String?
  pageStatus       String?  @default("draft")
  proposedTitle    String?
  priority         Int?
  phase            String?
  contentScope     String?
  masterAiPrompt   String?  @db.Text
  
  sections         PageSection[]
  blueprint        PageBlueprint?
  assets           SiteAsset[]
  generationJobs   GenerationJob[]
  
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

model PageSection {
  id                   String   @id @default(cuid())
  pageId               String
  page                 SitePage @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  sectionOrder         Int       // 1-10 (0 = blueprint, stored separately)
  sectionId            String    // e.g. "hero", "faq", "cta-banner"
  sectionName          String
  sectionLayout        String?   @db.Text
  sectionFields        String?   @db.Text  // pipe-separated field names
  sectionContentPrompt String?   @db.Text  // the AI prompt to send
  
  // Generated outputs
  sectionContent       Json?     // AI-generated JSON (field_name: value)
  generatedAt          DateTime?
  generationModel      String?
  
  // Image data
  imageRequired        Boolean   @default(false)
  imagePlacement       String?
  imagePrompt          String?   @db.Text
  imageAspectRatio     String?
  imageUrl             String?   // CDN URL after generation
  imageGeneratedAt     DateTime?
  
  @@unique([pageId, sectionId])
  @@index([pageId])
}

model PageBlueprint {
  id               String   @id @default(cuid())
  pageId           String   @unique
  page             SitePage @relation(fields: [pageId], references: [id], onDelete: Cascade)
  
  structurePrompt  String?  @db.Text  // section_content_prompt from order=0 row
  componentMap     Json?    // AI-generated: { section_id: { component, spacing, bg... } }
  wireframeUrl     String?  // generated wireframe image URL
  generatedAt      DateTime?
}

model SiteAsset {
  id           String   @id @default(cuid())
  pageId       String?
  page         SitePage? @relation(fields: [pageId], references: [id])
  sectionId    String?
  assetType    String    // "hero-illustration" | "deliver-icons" | "icon-sprite" | "wireframe"
  prompt       String?   @db.Text
  url          String?
  provider     String?   // "openrouter"
  model        String?   // "openai/dall-e-3"
  createdAt    DateTime  @default(now())
}

model GenerationJob {
  id           String   @id @default(cuid())
  pageId       String?
  page         SitePage? @relation(fields: [pageId], references: [id])
  sectionId    String?   // null = full page job
  jobType      String    // "content" | "blueprint" | "image" | "icon-sprite"
  status       String    @default("queued")  // queued | running | done | failed
  model        String?
  provider     String?   @default("openrouter")
  inputPrompt  String?   @db.Text
  outputRaw    String?   @db.Text
  errorMessage String?   @db.Text
  startedAt    DateTime?
  completedAt  DateTime?
  createdAt    DateTime  @default(now())
}

model SiteSettings {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String?  @db.Text
  updatedAt DateTime @updatedAt
  
  // Keys used:
  // "openrouter_api_key"
  // "openrouter_text_model"     e.g. "anthropic/claude-sonnet-4"
  // "openrouter_image_model"    e.g. "openai/dall-e-3"
  // "openrouter_icon_model"     e.g. "recraft-ai/recraft-v3-svg"
  // "site_generation_status"    e.g. "idle" | "running"
}
```

### 1a — CSV Import Script
Create `scripts/import-sections.ts`. This script reads both CSV files and populates `SitePage`, `PageSection`, and `PageBlueprint`.

```
Logic:
1. Read core-service-sections.csv and hub-and-static-sections.csv
2. For each unique url → upsert SitePage (use url as unique key)
3. For each row where section_order = "0" → upsert PageBlueprint (structurePrompt = section_content_prompt)
4. For each row where section_order >= "1" → upsert PageSection
5. Set imageRequired = true where image_required column = "yes"
6. Log counts on completion
```

Run with: `npx ts-node scripts/import-sections.ts`

---

## TASK 2 — Homepage Redesign (`/`)

**Replace the entire existing homepage** (`app/page.tsx` or `pages/index.tsx`).

The homepage has 10 sections in this exact order. Build each as a standalone React component in `components/home/`:

### Section 1 — `HeroFull`
```
Layout: Full-width centered
  - Tag pill (small indigo uppercase label, background #eef2ff, color #533afd, 4px radius)
  - H1: 56px weight-300 midnight, max 10 words
  - Subheadline: 20px weight-400 slate, max 22 words
  - Two CTAs side by side:
      Primary: filled indigo button, white text, 4px radius, 48px height
      Secondary: ghost button, midnight border 1px, midnight text
  - Stats strip below CTAs: 4 columns, number in 32px indigo, label in 14px slate
  - Background: white
  - Max width: 1320px centred
  - Mobile: stack vertically, CTAs full-width
```

### Section 2 — `ServiceCards4Col`
```
Layout: Full-width header + 4-column card grid
  - Section label: 12px uppercase tracking-wider indigo
  - Heading: 40px weight-300 midnight
  - 4 cards: indigo icon (40x40 from sprite) + 24px card title + 16px body + text link with →
  - Card border: 1px var(--color-frost), 4px radius
  - Background: var(--color-mist)
  - Hover state: border-color indigo, no shadow
```

### Section 3 — `FeaturedWork`
```
Layout: 3-column case study cards
  - Industry tag chip + project title (24px) + outcome stat (indigo) + "View case →" link
  - Card: white bg, 1px frost border, 4px radius
  - Background: white
```

### Section 4 — `WhyUs2Col`
```
Layout: 2-column
  - Left (40%): 40px weight-300 heading + 50-word body paragraph
  - Right (60%): 4 advantage items, each: indigo icon + bold title + body
  - Background: white
  - 1px frost divider between items
```

### Section 5 — `EngagementModels3Col`
```
Layout: 3-column model cards
  - Each: model name (24px bold) + "Best for:" chip + 20-word description
  - Highlight the middle card (Dedicated Team) with 1px indigo border
  - Background: var(--color-mist)
```

### Section 6 — `TestimonialRow`
```
Layout: 3 testimonial cards in a row
  - Each: 24px quote mark (indigo) + quote text (18px italic) + name + title + company flag chip
  - Background: white
```

### Section 7 — `TechStrip`
```
Layout: Full-width centered
  - Heading + horizontal scrollable chip row of 12 tech names
  - Chips: 14px, frost bg, midnight text, 4px radius
  - Background: var(--color-mist)
```

### Section 8 — `IndustryGrid6Col`
```
Layout: 6-column icon + name grid
  - Each: centered icon (SVG from sprite) + 14px industry name
  - Clickable → industry URL
  - Background: white
```

### Section 9 — `BlogPreview3Col`
```
Layout: 3-column article cards
  - Category tag + title (20px weight-400) + excerpt + "Read →" link
  - Card: white, 1px frost border, 4px radius
```

### Section 10 — `DarkCtaBand`
```
Layout: Full-width #061b31 dark band
  - Left: 40px weight-300 white heading + 18px slate-300 subheadline
  - Right: Primary CTA (indigo filled) + Secondary CTA (white ghost)
  - Padding: 80px vertical
  - Max width: 1320px inner
  - Mobile: stack, CTAs full-width
```

### Homepage Data Fetching
```typescript
// app/page.tsx
// Fetch from database: SELECT * FROM PageSection WHERE page.url = '/' ORDER BY section_order
// If section_content JSON is populated → render live data
// If section_content is null → render fallback placeholder skeleton
// Pass content to each section component as typed props
```

---

## TASK 3 — Section Rendering System

Build a **dynamic page renderer** for all service and hub pages.

### 3a — Component Registry
Create `lib/component-registry.ts`:
```typescript
// Maps section_id → React component
const COMPONENT_MAP = {
  'hero':                  HeroSplit,
  'service-overview':      TextWithOutcomes,
  'what-we-deliver':       CardGrid3Col,
  'process':               ProcessStrip4,
  'technology-stack':      TagCloudGroup,
  'who-its-for':           PersonaCards3Col,
  'industry-applications': IndustryGrid3Col,
  'faq':                   AccordionFull,
  'related-services':      RelatedCards3Col,
  'cta-banner':            DarkCtaBand,
  // Hub sections
  'services-grid':         ServiceCardsHub,
  'stats-bar':             StatsStrip4,
  'testimonials':          TestimonialRow,
  'related-hubs':          RelatedCards3Col,
  // Static sections
  'contact-form':          ContactFormSplit,
  'models-comparison':     ComparisonCards3Col,
  'faq-categories':        TabbedAccordion,
  // ... etc
}
```

### 3b — Dynamic Page Route
Create `app/[...slug]/page.tsx`:
```
1. Extract URL from slug params
2. Fetch page + sections from database (ordered by section_order)
3. Fetch blueprint component map if available
4. For each section:
   - Look up component from COMPONENT_MAP[section.sectionId]
   - Parse section.sectionContent (JSON) into typed props
   - Render component with props
5. If section.sectionContent is null → show ContentPending placeholder
6. Generate page metadata from section.sectionContent.h1 / section.sectionContent.tag_pill
```

### 3c — Section Components
Build all components in `components/sections/`. Each component:
- Accepts typed props matching the `section_fields` keys from the CSV
- Uses design system tokens (no hardcoded colours)
- Is fully responsive (mobile-first)
- Has a `isLoading` prop that shows a skeleton state

---

## TASK 4 — Admin: Content Generation Flow

Add to admin panel at route `/admin/content-generation`.

### 4a — Pages List View (`/admin/content-generation`)
```
- Table of all pages from SitePage
- Columns: URL | Cluster | Page Type | Status | Sections | Actions
- "Sections" shows: X/11 generated (progress bar)
- Filter by: cluster, page_type, generation_status
- Click row → opens page detail view
```

### 4b — Page Detail View (`/admin/content-generation/[pageId]`)
```
Displays all sections for the selected page:

Header:
  - Page title + URL + cluster badge
  - "Generate All Sections" button (queues all non-generated sections)
  - "Generate Blueprint" button

Sections table:
  Each row:
    - Section order + name + section_id
    - Status chip: Not generated | Generating... | Generated | Failed
    - "Generate" button → calls POST /api/admin/generate/content
    - "Regenerate" button (if already generated)
    - Expand toggle → shows generated JSON content preview (formatted)

Blueprint panel (collapsible):
  - Shows structurePrompt text
  - "Generate Component Map" button → calls POST /api/admin/generate/blueprint  
  - Displays componentMap JSON if generated
  - Shows wireframe image if generated
```

### 4c — API Routes

**POST `/api/admin/generate/content`**
```typescript
Body: { pageSectionId: string }

1. Load PageSection by id (include sectionContentPrompt)
2. Load SiteSettings for openrouter_api_key + openrouter_text_model
3. Call OpenRouter text API:
   POST https://openrouter.ai/api/v1/chat/completions
   model: settings.openrouter_text_model
   temperature: 0.3
   messages: [
     { role: "system", content: CONTENT_GENERATION_SYSTEM_PROMPT },
     { role: "user", content: section.sectionContentPrompt }
   ]
4. Parse JSON from response
5. Save to PageSection.sectionContent + generatedAt
6. Create GenerationJob record (status: done)
7. Return { success: true, content: parsedJson }
```

**CONTENT_GENERATION_SYSTEM_PROMPT** (hardcode this string in the route):
```
You are an expert B2B content writer for software development company websites.
You write for US and UK enterprise buyers: technically credible, commercially
direct, no fluff. You follow Stripe-style minimalism in tone — declarative
headings, weight-300 language, no exclamation marks, no clichés.

When given a section content brief, output ONLY a valid JSON object.
Keys must exactly match the field names listed in the prompt.
No markdown fences. No explanation outside the JSON.
All values are strings unless the field name ends in _array.
Do not add fields not listed. Do not omit any listed field.
```

**POST `/api/admin/generate/blueprint`**
```typescript
Body: { pageBlueprintId: string }
Same flow as content but use BLUEPRINT_SYSTEM_PROMPT from generation-pipeline-prompts.docx.
Save result to PageBlueprint.componentMap.
```

**POST `/api/admin/generate/content-bulk`**
```typescript
Body: { pageId: string }
Queue all non-generated PageSection rows for this page.
Process sequentially (avoid rate limits).
Return job status.
```

---

## TASK 5 — Admin: OpenRouter Settings

Add to admin at `/admin/settings/openrouter`.

### 5a — Settings Page UI

```
Page title: "OpenRouter API Settings"

Section 1 — API Configuration
  - API Key field (password input, masked, save to SiteSettings key="openrouter_api_key")
  - "Test Connection" button → GET https://openrouter.ai/api/v1/models, show success/fail
  - Save button

Section 2 — Text Generation Models
  - Dropdown: Text model for content generation
    Options: 
      anthropic/claude-sonnet-4-6 (Recommended)
      openai/gpt-4o
      google/gemini-flash-1.5
      meta-llama/llama-3.1-70b-instruct
  - Save to SiteSettings key="openrouter_text_model"

Section 3 — Image Generation Models
  - Dropdown: Image model for illustrations
    Options:
      openai/dall-e-3 (Recommended)
      black-forest-labs/flux-1.1-pro
      stability/stable-diffusion-3-medium
  - Save to SiteSettings key="openrouter_image_model"
  
  - Dropdown: Icon model (SVG output)
    Options:
      recraft-ai/recraft-v3-svg (Recommended — returns real SVG)
      openai/dall-e-3
  - Save to SiteSettings key="openrouter_icon_model"

Section 4 — Image Generation Panel
  
  Sub-section: Hero Illustrations
    - Counter: "X / 50 hero images generated"
    - "Generate All Hero Images" button → queues all sections where:
        section_id = "hero" AND image_required = true AND imageUrl IS NULL
    - Progress bar showing generation progress
    - Thumbnail grid of generated images (url from PageSection.imageUrl)
    - Each thumbnail: page URL label + "Regenerate" button

  Sub-section: Deliver Icons
    - Counter: "X / 50 icon grids generated"
    - "Generate All Deliver Icon Grids" button
    - Same thumbnail grid pattern

  Sub-section: Master Icon Sprite
    - Status: "Not generated" | "Generated on [date]"
    - Prompt preview (read from master-icon-prompt.txt, which you should embed 
      as a constant in the codebase at lib/constants/icon-sprite-prompt.ts)
    - "Generate Icon Sprite" button → calls POST /api/admin/generate/icon-sprite
    - Preview of generated sprite (if url exists in SiteAsset where assetType="icon-sprite")
    - "Download SVG" button

  Sub-section: Page Wireframes (Optional)
    - "Generate All Wireframes" button
    - Grid of generated wireframe images

Section 5 — Bulk Generation Controls
  - "Generate ALL Content (All Pages)" button
    → Confirmation modal: "This will queue X content generation jobs. Continue?"
    → On confirm: queue all un-generated PageSection rows
    → Show live progress counter
  
  - Generation log: last 20 GenerationJob entries in a scrollable table
    Columns: Page URL | Section | Type | Status | Model | Time | Error
```

### 5b — Image Generation API Route

**POST `/api/admin/generate/image`**
```typescript
Body: { pageSectionId: string }

1. Load PageSection (include imagePrompt, imageAspectRatio)
2. Load SiteSettings for openrouter_api_key + openrouter_image_model
3. Determine size from imageAspectRatio:
   "4:3"  → "1792x1024"
   "1:1"  → "1024x1024"  
   "9:16" → "1024x1792"
4. Call OpenRouter image API:
   POST https://openrouter.ai/api/v1/images/generations
   { model, prompt: section.imagePrompt, n: 1, size, quality: "standard", response_format: "url" }
5. Get URL from response.data[0].url
6. Optionally: fetch and upload to your CDN (Cloudflare R2 / S3 / Vercel Blob)
7. Save final URL to PageSection.imageUrl + imageGeneratedAt
8. Create SiteAsset record
9. Return { success: true, imageUrl }
```

**POST `/api/admin/generate/icon-sprite`**
```typescript
1. Load master icon prompt from lib/constants/icon-sprite-prompt.ts
2. Load SiteSettings for openrouter_api_key + openrouter_icon_model
3. If model is "recraft-ai/recraft-v3-svg":
   → Call OpenRouter, response will be SVG markup string
   → Save SVG to /public/icons/sprite.svg
4. Else (DALL-E 3 / Flux):
   → Generate PNG at 1024x1024
   → Save URL to SiteAsset
5. Create SiteAsset record (assetType: "icon-sprite")
6. Return { success: true, url }
```

---

## TASK 6 — Icon Sprite Constant

Create `lib/constants/icon-sprite-prompt.ts`:

```typescript
export const MASTER_ICON_PROMPT = `Generate a set of flat SVG icons for a software development company website.
Style: geometric line art, 1.5px stroke weight, #533afd indigo stroke on white fill.
No gradients. No shadows. 4px rounded corners where shapes appear.
Each icon 40x40px canvas. Icons needed:
code-brackets, mobile-device, brain-circuit (AI), cloud-upload,
settings-gear, layers-stack, shield-check, users-group,
rocket-launch, chart-bar, document-text, api-plug,
flutter-diamond, react-atom, nodejs-hexagon, python-snake,
aws-cloud, kubernetes-wheel, docker-whale, terraform-blocks.
Deliver as a single SVG sprite sheet with viewBox 0 0 40 40 per icon.`

export const ICON_KEYS = [
  'code-brackets', 'mobile-device', 'brain-circuit', 'cloud-upload',
  'settings-gear', 'layers-stack', 'shield-check', 'users-group',
  'rocket-launch', 'chart-bar', 'document-text', 'api-plug',
  'flutter-diamond', 'react-atom', 'nodejs-hexagon', 'python-snake',
  'aws-cloud', 'kubernetes-wheel', 'docker-whale', 'terraform-blocks',
] as const

export type IconKey = typeof ICON_KEYS[number]
```

---

## Execution Order

Complete tasks in this sequence. Do not start the next task until the current one compiles and works:

```
1. Prisma schema additions → run migration
2. Import script → seed database from both CSVs
3. SiteSettings model + OpenRouter settings admin page (need API key before generation works)
4. Content generation API routes (text only first)
5. Admin content generation UI
6. Homepage redesign (use static fallback data first, connect to DB after)
7. Dynamic page renderer + section components
8. Image generation API routes
9. Image generation admin panel
10. Icon sprite constant + generation route
```

---

## Do NOT Change

- Existing authentication / session system
- Existing blog CMS routes (if any)
- Existing contact form and its backend handler
- Any existing portfolio / case study routes
- Database connection config (`datasource db`)
- Environment variable names already in `.env`
- The existing `prisma/schema.prisma` models — only ADD new ones

---

## Questions to Ask Before Starting

If any of the following are unclear, ask before writing code:

1. What is the existing admin panel route prefix? (`/admin`, `/dashboard`, etc.)
2. Is there an existing `SitePage` or `Page` model already in Prisma?
3. Where should generated images be stored? (Vercel Blob / S3 / Cloudflare R2 / local `/public`)
4. Is there an existing layout component (`AdminLayout`) to wrap the new admin pages in?
5. What Next.js version is this project on? (13, 14, or 15 — affects App Router vs Pages Router)
