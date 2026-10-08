import csv, io, json, re, zipfile
from pathlib import Path
from collections import Counter, defaultdict

ROOT = Path(__file__).resolve().parent
OUT = ROOT / 'revised-seo-plan'
OUT.mkdir(exist_ok=True)

def write_csv(name, rows):
    if not rows: return
    with (OUT / name).open('w', newline='', encoding='utf-8-sig') as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0]))
        w.writeheader(); w.writerows(rows)

def number(v):
    return float(v) if v not in ('', None) else None

data = []
summary = []
for path in sorted(ROOT.glob('*semrush.csv')):
    rows = list(csv.DictReader(path.open(encoding='utf-8-sig', newline='')))
    organic = [r for r in rows if r['Position Type'] == 'Organic']
    summary.append(dict(source=path.name, exported_rows=len(rows), organic_rows=len(organic), unique_organic_keywords=len({r['Keyword'].strip().lower() for r in organic}), estimated_organic_traffic_row_sum=sum(float(r['Traffic'] or 0) for r in organic), earliest_keyword_timestamp=min(r['Timestamp'] for r in rows if r['Timestamp']), latest_keyword_timestamp=max(r['Timestamp'] for r in rows if r['Timestamp']), caveat='Export subset; US database (user confirmed); traffic row sum is not actual visits; keywords can appear at multiple URLs.'))
    for r in organic:
        data.append(dict(r, source=path.name))
write_csv('competitor-export-summary.csv', summary)

z = zipfile.ZipFile(ROOT / 'google-search-netofficials.zip')
gsc = {n: list(csv.DictReader(io.StringIO(z.read(n).decode('utf-8-sig')))) for n in z.namelist() if n.endswith('.csv')}
pages = {r['Top pages'].replace('https://netofficials.com', '') or '/': r for r in gsc['Pages.csv']}
own = defaultdict(list)
for r in data:
    if r['source'] == 'netofficials-semrush.csv': own[r['Keyword'].strip().lower()].append(r)

# Editorial mapping: phrases are research candidates, not claims of measured demand.
specs = [
('P0','0–30','Foundation','/','Improve existing','Brand + combined proposition','Software Development, Web Design & Digital Marketing | Netofficials','netofficials; software development and digital marketing company','Business overview, India delivery, buyer paths, proof, consultation','Portfolio proof and accurate service capabilities'),
('P0','0–30','Foundation','/services','Improve existing','Service directory','Software, Website & Digital Marketing Services | Netofficials','software and digital marketing services','Two branches: software/web and search marketing; links to primary services','Service ownership and deliverables'),
('P0','0–30','Foundation','/about','Improve existing','Company verification','About Netofficials | Team, Experience & Delivery','netofficials team','Named team, experience, real location, delivery process','Verified bios and company details'),
('P0','0–30','Foundation','/contact','Improve existing','Qualified enquiry','Discuss Your Software, Website or Marketing Project','contact netofficials','Service, project goal, country, budget range, timeline; tracked submission','CRM routing and working form'),
('P0','0–30','Foundation','/portfolio','Improve existing','Proof hub','Our Work | Software, Websites & Search Marketing','netofficials portfolio','Project cards, scope, role, links to detailed case studies','Permission to publish client work'),
('P1','0–30','Software','/custom-software-development','Improve existing','Core service','Custom Software Development Services | Netofficials','custom software development services; custom application development services; custom software development company','Problems, process, deliverables, integrations, cost factors, proof, estimate CTA','Software project evidence'),
('P1','0–30','Web','/web-development','Improve existing','Core service','Website Development Services | Netofficials','web development services; website development company','Business websites, CMS, integrations, performance, launch, support','Website portfolio and supported platforms'),
('P1','31–60','Web','/web-design','Check live inventory; create if absent','Design service','Website Design Services | Netofficials','website design services; web design services','UX, content hierarchy, wireframes, responsive design, conversion paths','Design work and process'),
('P1','0–30','SEO','/seo-services','Check live inventory; create if absent','Core service','SEO Services in India for Global Businesses | Netofficials','seo services india; seo company in india; seo services','Audit, technical/on-page work, content, reporting, realistic outcomes','SEO process and verified results'),
('P1','0–30','Paid Search','/ppc-services','Check live inventory; create if absent','Core service; SEM and PPC combined','PPC & Search Engine Marketing Services | Netofficials','search engine marketing services india; ppc management services; google ads management services','Account audit, search campaigns, landing pages, tracking, optimization, fee vs ad spend','Campaign expertise and approved results'),
('P1','31–60','Web','/website-redesign','Check live inventory; create if absent','Specialist service','Website Redesign Services | Netofficials','website redesign services','Diagnosis, migration protection, design, conversion and launch','Before/after work and migration process'),
('P2','61–90','Web','/ecommerce-development','Improve existing if supported','Specialist service','eCommerce Website Development Services | Netofficials','ecommerce website design services; ecommerce development solutions','Catalog, checkout, payments, integrations, performance, maintenance','Actual ecommerce builds; confirm platforms'),
('P2','61–90','Software','/mvp-development','Improve existing if supported','Specialist service','MVP Software Development Services | Netofficials','mvp software development services','Discovery, feature scope, validation, milestones, delivery tradeoffs','MVP project evidence'),
('P2','91–180','Software','/saas-development','Improve existing if supported','Specialist service','SaaS Development Services | Netofficials','saas development services; saas software development company','Tenancy, subscriptions, onboarding, security and support','SaaS project evidence'),
('P2','31–60','SEO','/seo-packages','Check live inventory; create if absent','Commercial pricing','SEO Packages & Engagement Options | Netofficials','seo packages india; seo packages in india','Scope tiers, exclusions, fees/ranges if approved, reporting, fit','Approved commercial terms'),
('P2','61–90','SEO','/technical-seo','Check live inventory; create if absent','Specialist service','Technical SEO Services | Netofficials','technical seo services; technical seo company india','Crawl/index diagnosis, canonicals, redirects, rendering, performance','Technical audit sample and delivery capability'),
('P2','61–90','SEO','/local-seo','Conditional; validate target buyers','Specialist service','Local SEO Services | Netofficials','local seo services','Eligible business profiles, citations, local pages, reviews, measurement','Local business customer demand and results'),
('P2','61–90','Paid Search','/ppc-management-pricing','Check live inventory; create if absent','Commercial pricing','PPC Management Pricing & Packages | Netofficials','ppc pricing packages; ppc management pricing packages; ppc services packages','Management fee, setup, ad spend, included channels, reporting','Approved fee structure'),
('P2','31–60','Proof','/case-studies','Check live inventory; create if absent','Case study hub','Client Case Studies | Netofficials','netofficials case studies','Software, website and marketing project outcomes with individual pages','At least two publishable cases'),
('P1','31–60','Content','/blog','Check live inventory; create if absent','Content hub','Software, Websites & Search Marketing Insights','netofficials insights','Topic categories tied to active services; author attribution','Named expert reviewers'),
('P3','91–180','Software','/react-development','Selective existing-page improvement','Technology page','React Development Services | Netofficials','react development services; react development company','Distinct engineering scope, relevant proof, link to web/software services','React delivery proof; do not prioritize on impressions alone'),
('P3','91–180','Software','/retail-software-development','Conditional existing-page improvement','Industry page','Retail Software Development | Netofficials','retail software development services','Retail workflows, integration problems, measurable case','Retail client evidence'),
('P3','91–180','Software','/healthcare-software-development','Conditional existing-page improvement','Industry page','Healthcare Software Development | Netofficials','healthcare software development company','Actual healthcare workflows and bounded security/compliance claims','Healthcare work and verifiable domain expertise'),
]
articles = [
('Software','custom-software-development-cost','software development cost','Custom Software Development Cost: Scope, Estimates and Tradeoffs','/custom-software-development','31–60'),
('Software','custom-software-vs-off-the-shelf','custom software vs off the shelf','Custom Software vs Off-the-Shelf: A Buyer’s Decision Guide','/custom-software-development','31–60'),
('Software','software-development-project-checklist','software development requirements checklist','What to Prepare Before Requesting a Software Development Quote','/custom-software-development','61–90'),
('Software','software-development-timeline','software development timeline','What Determines a Custom Software Development Timeline?','/custom-software-development','61–90'),
('Software','mvp-development-cost','mvp development cost','MVP Development Cost and Scope Planning','/mvp-development','91–180'),
('Software','mvp-vs-prototype','mvp vs prototype','MVP vs Prototype vs Proof of Concept','/mvp-development','91–180'),
('Web','website-redesign-checklist','website redesign checklist','Website Redesign Checklist: Content, SEO and Launch','/website-redesign','31–60'),
('Web','website-development-cost-india','website development cost india','Website Development Cost in India: What Changes the Quote?','/web-development','31–60'),
('Web','wordpress-vs-custom-website','wordpress vs custom website','WordPress vs a Custom Website: Choosing for Your Business','/web-development','61–90'),
('Web','website-redesign-seo-migration','website redesign seo checklist','How to Preserve Search Visibility During a Website Redesign','/website-redesign','61–90'),
('Web','b2b-website-conversion-checklist','b2b website conversion','B2B Website Conversion Checklist for Qualified Enquiries','/web-design','91–180'),
('Web','ecommerce-development-cost','ecommerce website development cost','eCommerce Website Cost: Features, Integrations and Support','/ecommerce-development','91–180'),
('SEO','seo-cost-india','seo cost; seo pricing india','SEO Cost in India: Scope, Fees and What to Compare','/seo-packages','31–60'),
('SEO','how-long-does-seo-take','how long does seo take','How Long Does SEO Take? Milestones and Dependencies','/seo-services','31–60'),
('SEO','seo-audit-checklist','seo audit checklist','SEO Audit Checklist for a Business Website','/technical-seo','61–90'),
('SEO','choosing-an-seo-agency','how to choose an seo agency','How to Evaluate an SEO Agency: Scope, Evidence and Reporting','/seo-services','61–90'),
('SEO','seo-for-small-business','seo for small business','SEO for Small Businesses: Priorities Before Scaling Content','/seo-services','91–180'),
('SEO','seo-vs-ppc','seo vs ppc','SEO vs PPC: Budget, Timeline and Lead Quality','/seo-services; /ppc-services','31–60'),
('Paid Search','google-ads-management-cost','google ads management cost','Google Ads Management Cost: Fees vs Advertising Spend','/ppc-management-pricing','61–90'),
('Paid Search','ppc-audit-checklist','ppc audit checklist','PPC Audit Checklist: Tracking, Search Terms and Landing Pages','/ppc-services','61–90'),
('Paid Search','google-ads-not-generating-leads','google ads not generating leads','Why Google Ads Generate Clicks but Few Qualified Leads','/ppc-services','91–180'),
('Paid Search','ppc-landing-page-checklist','ppc landing page best practices','PPC Landing Page Checklist for Better Enquiries','/ppc-services; /web-design','91–180'),
('Paid Search','sem-vs-seo-vs-ppc','sem vs seo vs ppc','SEM, SEO and PPC: What Each Service Includes','/ppc-services; /seo-services','91–180'),
('Software','saas-development-cost','saas development cost','SaaS Development Cost: Product Scope and Operating Costs','/saas-development','91–180'),
]
for cluster, slug, keyword, title, parent, phase in articles:
    specs.append(('P2' if phase != '91–180' else 'P3',phase,cluster,'/blog/'+slug,'Check live inventory; create if absent','Buyer guide',title,keyword,'Answer the buyer question with examples, constraints and a relevant next step; parent: '+parent,'Expert review; original examples; validate SERP and target-country demand'))

all_evidence = []
mapped = []
for i, (priority,phase,cluster,url,action,kind,title,phrases,brief,gate) in enumerate(specs,1):
    terms=[k.strip().lower() for k in phrases.split(';')]
    matches=[r for r in data if r['Keyword'].strip().lower() in terms and r['source']!='netofficials-semrush.csv']
    # Preserve every matching Organic record; do not sum synonym volumes or hide duplicate URLs.
    for r in matches:
        all_evidence.append(dict(page_id=f'P{i:02}',proposed_url=url,keyword=r['Keyword'],source=r['source'],database='US (user confirmed)',volume=r['Search Volume'],kd=r['Keyword Difficulty'],competitor_position=r['Position'],competitor_url=r['URL'],estimated_traffic=r['Traffic'],intent_label=r['Keyword Intents'],keyword_timestamp=r['Timestamp'],position_type=r['Position Type']))
    best=min(matches,key=lambda r:float(r['Position'] or 999)) if matches else None
    gp=pages.get(url,{})
    mapped.append(dict(page_id=f'P{i:02}',priority=priority,phase_days=phase,cluster=cluster,url=url,action=action,page_type=kind,proposed_title=title,target_keyword_candidates=phrases,evidence_status='Exact phrase observed in supplied competitor Organic export; US database (user confirmed)' if matches else 'Editorial candidate; exact phrase metrics not supplied',example_keyword=best['Keyword'] if best else '',example_volume=best['Search Volume'] if best else '',example_kd=best['Keyword Difficulty'] if best else '',example_competitor=best['source'] if best else '',example_competitor_position=best['Position'] if best else '',gsc_clicks=gp.get('Clicks',''),gsc_impressions=gp.get('Impressions',''),gsc_position=gp.get('Position',''),content_scope=brief,publish_gate=gate))
core_urls = {'/', '/services', '/about', '/contact', '/custom-software-development', '/web-development', '/seo-services', '/ppc-services'}
for page in mapped:
    if page['url'] in core_urls:
        page['publish_gate'] = 'Core release: verify actual capabilities, scope and company facts; technical checks complete. Published case studies are optional; every outcome/project claim requires evidence.'
    elif page['url'] in {'/portfolio', '/case-studies'}:
        page['publish_gate'] = 'Hold publication until real publishable work and permissions exist; substantiate all outcomes. Launch a smaller site if proof is unavailable.'
    page['release_class'] = 'Core: can publish accurate offering after technical checks' if page['url'] in core_urls else 'Requires stated scope/evidence/commercial gate'
    page['schedule_note'] = 'Standard: four buyer pieces/month; floor: two/month. Priority window subject to capacity and parent-page readiness.'
guides = [p for p in mapped if p['page_type'] == 'Buyer guide']
first_slugs = ['custom-software-development-cost', 'website-development-cost-india', 'seo-cost-india', 'seo-vs-ppc']
ordered_guides = sorted(guides, key=lambda p: (0 if p['url'].split('/')[-1] in first_slugs else 1, p['phase_days'], p['page_id']))
for index, page in enumerate(ordered_guides):
    page['phase_days'] = '31–60' if index < 4 else '61–90' if index < 8 else '91–180'
write_csv('page-and-content-plan.csv',mapped)
write_csv('mapped-keyword-evidence.csv',all_evidence)

inventory=[]
for url,r in pages.items():
    planned=next((p for p in mapped if p['url']==url),None)
    decision=planned['action'] if planned else 'Retain pending crawl, business-fit, content and backlink review; outside first release'
    if url in ('/home','/index.html','/index.php'): decision='Investigate homepage duplicate/canonical/redirect behavior; no migration decision from export alone'
    if url in ('/privacy','/privacy-policy'): decision='Review legal-page overlap; preserve required legal content'
    if url in ('/qa-testing-services','/software-testing-services'): decision='Review same-intent overlap; merge only after content, query and backlink review'
    inventory.append(dict(url=url,clicks=r['Clicks'],impressions=r['Impressions'],ctr=r['CTR'],position=r['Position'],decision=decision,source='google-search-netofficials.zip / Pages.csv',caveat='Performance export is not a crawl or complete URL inventory'))
write_csv('existing-url-decisions.csv',inventory)
chart=gsc['Chart.csv']; clicks=sum(int(r['Clicks']) for r in chart); impressions=sum(int(r['Impressions']) for r in chart)
diagnostics=dict(date_start=chart[0]['Date'],date_end=chart[-1]['Date'],days=len(chart),clicks=clicks,impressions=impressions,ctr_pct=clicks/impressions*100,weighted_position=sum(int(r['Impressions'])*float(r['Position']) for r in chart)/impressions,page_rows=len(pages),query_rows=len(gsc['Queries.csv']),country_rows=len(gsc['Countries.csv']),page_impression_sum=sum(int(r['Impressions']) for r in pages.values()),query_impression_sum=sum(int(r['Impressions']) for r in gsc['Queries.csv']),usa_impressions=next(r['Impressions'] for r in gsc['Countries.csv'] if r['Country']=='United States'),india_impressions=next(r['Impressions'] for r in gsc['Countries.csv'] if r['Country']=='India'),mapped_pages=len(mapped),exact_evidence_pages=sum(p['evidence_status'].startswith('Exact') for p in mapped),evidence_rows=len(all_evidence))
(OUT/'analysis-diagnostics.json').write_text(json.dumps(diagnostics,indent=2),encoding='utf-8')
print(json.dumps(diagnostics,indent=2))
print('Files:',[p.name for p in OUT.iterdir()])
