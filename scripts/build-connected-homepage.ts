import fs from "node:fs";
import { load } from "cheerio";

// Keep the existing delivery, FAQ and enquiry content, and its imported copy slots.
const file = "homepage-concept/software-led.html";
const $ = load(fs.readFileSync(file, "utf8"));
$(".connected-proof").remove();
$("link[href='connected-home.css']").remove();
const arrow = '<span aria-hidden="true">↗</span>';
const icon = (type: string) => {
  const paths: Record<string, string> = {
    software:
      '<rect x="4" y="7" width="40" height="32" rx="4"/><path d="m17 18-6 6 6 6m14-12 6 6-6 6M26 16l-4 16"/>',
    mobile:
      '<rect x="13" y="3" width="22" height="42" rx="5"/><path d="M20 9h8M21 38h6m-8-14 4 4 8-9"/>',
    ai: '<path d="m24 5 5 13 14 6-14 6-5 13-5-13-14-6 14-6Z"/><path d="M38 3v8m-4-4h8"/>',
    cloud:
      '<path d="M14 32a9 9 0 1 1-1-18 12 12 0 0 1 23 2 8 8 0 0 1-1 16M24 24v19m-6-6 6 6 6-6"/>',
    web: '<rect x="4" y="7" width="40" height="32" rx="4"/><path d="M4 16h40M11 11h1m4 0h1M12 23h24M12 30h15"/>',
    search:
      '<circle cx="21" cy="21" r="13"/><path d="m31 31 12 12M14 25l5-6 5 3 5-8"/>',
  };
  return `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[type]}</svg>`;
};
const art = (type: string) =>
  `<div class="hub-art hub-art-${type}" aria-hidden="true">${icon(type)}<span class="icon-orbit"></span><span class="icon-spark">+</span></div>`;
const hubs = [
  {
    id: "software",
    title: "Custom software & web applications",
    label: "BUILD AROUND YOUR BUSINESS",
    body: "Replace disconnected tools and manual work with a product built around your operations. Start with an MVP, connect your systems, or modernize the software you already rely on.",
    service: "Custom software",
    parent: "custom-software.html",
    links: [
      ["Web applications", "web-application.html"],
      ["SaaS development", "/saas-development-services"],
      ["MVP development", "/mvp-development-services"],
      ["ERP development", "/erp-development-services"],
      ["CRM development", "/crm-development-services"],
      ["API integrations", "/api-development-services"],
      ["Legacy modernization", "/legacy-software-modernisation"],
    ],
  },
  {
    id: "mobile",
    title: "Mobile applications",
    label: "PUT YOUR BUSINESS IN THEIR HANDS",
    body: "Put your service in your customers’ hands. Build an intuitive app for customers or your team, with the right platform, integrations and everyday workflows.",
    service: "Mobile application development",
    parent: "/mobile-app-development",
    links: [
      ["Android apps", "/android-app-development"],
      ["iOS apps", "/ios-app-development"],
      ["Flutter development", "/flutter-app-development"],
      ["React Native development", "/react-native-app-development"],
      ["Cross-platform apps", "/cross-platform-app-development"],
    ],
  },
  {
    id: "ai",
    title: "AI & business automation",
    label: "MAKE ROOM FOR MORE USEFUL WORK",
    body: "Give repetitive work a smarter path. Explore document workflows, knowledge assistants and connected automations, with human review where it matters.",
    service: "AI & business automation",
    parent: "/ai-development-services",
    links: [
      ["AI automation", "/ai-automation-services"],
      ["AI integrations", "/ai-integration-services"],
      ["AI chatbots", "/ai-chatbot-development"],
      ["Generative AI", "/generative-ai-development"],
      ["AI consulting", "/ai-consulting-services"],
    ],
  },
  {
    id: "cloud",
    title: "Cloud & DevOps",
    label: "CONNECT YOUR NEXT STAGE",
    body: "Make your next release easier to run. Plan cloud migration, deployment automation and infrastructure around your application, your team and your next stage.",
    service: "Cloud & DevOps",
    parent: "/cloud-services",
    links: [
      ["Cloud migration", "/cloud-migration-services"],
      ["DevOps services", "/devops-services"],
      ["AWS services", "/aws-services"],
      ["Azure services", "/azure-services"],
      ["Google Cloud services", "/google-cloud-services"],
    ],
  },
  {
    id: "web",
    title: "Websites & eCommerce",
    label: "YOUR DIGITAL FRONT DOOR",
    body: "Clear design, practical functionality and a website that helps customers take the next step.",
    service: "Website design & development",
    parent: "website-development.html",
    links: [
      ["Website development", "website-development.html"],
      ["Website design", "web-design.html"],
      ["Website redesign", "website-redesign.html"],
      ["eCommerce development", "ecommerce-development.html"],
      ["UI/UX design", "/ui-ux-design"],
    ],
  },
  {
    id: "search",
    title: "SEO & paid search",
    label: "SUPPORT WHAT COMES NEXT",
    body: "Connect your website with relevant searches through focused organic and paid search work.",
    service: "SEO",
    parent: "seo-services.html",
    links: [
      ["SEO services", "seo-services.html"],
      ["Technical SEO", "/technical-seo-services"],
      ["Local SEO", "/local-seo-services"],
      ["eCommerce SEO", "/ecommerce-seo-services"],
      ["PPC services", "ppc-services.html"],
      ["Google Ads", "/google-ads-management"],
    ],
  },
];
const hubHTML = hubs
  .map(
    (h, i) =>
      `<article class="hub-card ${i > 3 ? "hub-compact" : ""}" data-hub="${h.id}"><div class="hub-number">0${i + 1} / ${h.label}</div>${art(h.id)}<h3>${h.title}</h3><p>${h.body}</p><div class="hub-links">${h.links.map(([label, href]) => `<a data-published-link="true" data-track="service_hub_click" data-hub="${h.id}" href="${href}">${label}${arrow}</a>`).join("")}</div><div class="hub-actions"><a data-published-link="true" data-track="service_hub_click" data-hub="${h.id}" href="${h.parent}">Explore ${h.id === "search" ? "SEO" : h.id === "web" ? "website" : h.id === "ai" ? "AI" : h.id} services ${arrow}</a><a href="#contact" data-service="${h.service}" data-track="consultation_click" data-hub="${h.id}">Discuss your project ${arrow}</a></div></article>`,
  )
  .join("");
$(".hero-shell, .connected-hero").replaceWith(
  `<section class="connected-hero" data-section="hero" aria-labelledby="hero-title"><div class="wrap connected-hero-grid"><div class="hero-copy"><div class="eyebrow" data-copy-slot="t0">YOUR NEXT CHAPTER, CONNECTED</div><h1 id="hero-title"><span data-copy-slot="t1">Software that fits.</span><br><span data-copy-slot="t2">Apps that connect.</span><br><span class="hero-accent" data-copy-slot="t3">Ideas that move you.</span></h1><p class="intro" data-copy-slot="t4">Custom software, mobile applications, AI and cloud. Connect your next business idea with the expertise to build it.</p><div class="actions"><a class="button" href="#contact" data-track="consultation_click" data-hub="hero" data-copy-slot="t5">Discuss your project ↗</a><a class="button outline" href="#services" data-copy-slot="t6">Explore our services ↓</a></div><div class="hero-note"><span data-copy-slot="t7">India-based team</span><span data-copy-slot="t8">Global outlook</span><span data-copy-slot="t9">Business-first scope</span></div></div><div class="connected-visual" role="img" aria-label="Conceptual software connected-workspace connecting a mobile app, AI workflow and cloud infrastructure"><div class="visual-grid"></div><div class="connected-workspace"><div class="connected-workspace-top"><span class="connected-workspace-brand">N / CONNECTED WORKSPACE</span><span class="connected-workspace-status">Project overview</span></div><div class="connected-workspace-layout"><div class="connected-workspace-sidebar">${icon("software")}<i></i><i></i><i></i></div><div class="connected-workspace-content"><small>YOUR NEXT CHAPTER</small><h2>Everything. Working together.</h2><div class="connected-workspace-modules"><div>${icon("software")}<b>Software</b><span>Connected workflows</span></div><div>${icon("ai")}<b>Intelligence</b><span>Useful automation</span></div></div><div class="connected-workspace-flow"><span>Idea</span><i></i><span>Build</span><i></i><span>Launch</span></div></div></div></div><div class="mobile-panel"><div class="mobile-speaker"></div>${icon("mobile")}<strong>Made for<br>your people.</strong><div class="mobile-lines"><i></i><i></i></div><div class="mobile-action">Next step →</div></div><div class="cloud-panel">${icon("cloud")}<div><b>Cloud connected</b><span>Built to evolve</span></div></div><div class="visual-caption">SOFTWARE + MOBILE + AI + CLOUD<span>Concept illustration</span></div></div></div><div class="wrap capability-strip"><span>ONE CONNECTED DEVELOPMENT PARTNER</span><b>Business software</b><b>Mobile experiences</b><b>AI & automation</b><b>Cloud & DevOps</b></div></section>`,
);
$("#services").replaceWith(
  `<section class="section wrap connected-services" id="services"><div class="section-head"><div><div class="eyebrow">EXPLORE OUR CAPABILITIES</div><h2>The right expertise.<br><span>For your next move.</span></h2></div><p>Start with what your business needs. Explore a service in detail, or talk through a connected scope.</p></div><div class="hub-grid">${hubHTML}</div><div class="hub-help"><div><strong>A clear problem. An open question.</strong><p>You don't need a finished brief to start a conversation.</p></div><a class="button" href="#contact" data-track="consultation_click" data-hub="scope">Talk through your idea ${arrow}</a></div></section>`,
);
$(".marketing-section").remove();
const retainedHubSlots: Record<string, [string, string]> = {
  software: ["t21", "t23"],
  mobile: ["t35", "t37"],
  web: ["t63", "t65"],
};
for (const [hub, [heading, body]] of Object.entries(retainedHubSlots)) {
  const card = $(`.hub-card[data-hub='${hub}']`);
  card.children("h3").attr("data-copy-slot", heading);
  card.children("p").attr("data-copy-slot", body);
}
$("#services .section-head .eyebrow").attr("data-copy-slot", "t17");
$("#services .section-head h2").attr("data-copy-slot", "t18");
$("#services .section-head h2>span").attr("data-copy-slot", "t19");
$("#services .section-head>p").attr("data-copy-slot", "t20");
// Remove the original standalone marketing block, now represented by the supporting hub.
$("section")
  .filter((_, el) => $(el).find(".marketing-cards").length > 0)
  .remove();
$("#approach").before(
  `<section class="section wrap connected-proof" id="work"><div class="section-head"><div><div class="eyebrow">FROM THE BRIEF TO THE BUILD</div><h2>Know what you're building.<br><span>And what happens next.</span></h2></div><p>A useful scope makes the work easier to review. Start with the business problem, agree the priorities and define the next steps together.</p></div><div class="proof-grid"></div><div class="delivery-promises"><div><span>01</span><h3>A shared brief</h3><p>Users, workflows and the problem your project needs to solve.</p></div><div><span>02</span><h3>Reviewable progress</h3><p>Agreed deliverables and milestones to guide the conversation.</p></div><div><span>03</span><h3>A considered handover</h3><p>Acceptance criteria, responsibilities and the next stage.</p></div></div></section>`,
);
const select = $("select[name=service]");
select.contents().filter((_,node)=>node.type==="text").remove();
if(!select.find("option").toArray().some(el=>$(el).text()==="Custom software")) select.find("option").first().after('<option>Custom software</option>');
$(".fit-head h2").html(
  '<span data-copy-slot="t81">A new idea. An existing system.</span><br><span data-copy-slot="t82">Or a product ready for more.</span>',
);
const nextStage = $(".fit-grid article").last();
nextStage
  .children("span")
  .attr("data-copy-slot", "t94")
  .text("PREPARE YOUR NEXT STAGE");
nextStage
  .children("p")
  .attr("data-copy-slot", "t97")
  .text(
    "Explore the cloud infrastructure and automation your next stage of development needs.",
  );
nextStage
  .children("a")
  .attr("href", "#contact")
  .attr("data-service", "Cloud & DevOps")
  .attr("data-track", "consultation_click")
  .attr("data-hub", "next-stage")
  .attr("data-copy-slot", "t98")
  .text("Discuss your next stage ↗");
for (const label of ["AI & business automation", "Cloud & DevOps"])
  if (
    !select
      .find("option")
      .toArray()
      .some((el) => $(el).text() === label)
  )
    select.append(`<option>${label.replaceAll("&", "&amp;")}</option>`);
$("form textarea[name=goal]").attr("minlength", "10").attr("maxlength", "5000");
$("form input[name=name]").attr("maxlength", "120");
$("form input[name=email]").attr("maxlength", "254");
$("form button[type=submit]")
  .html(
    '<span data-copy-slot="t193">Discuss my project </span><span aria-hidden="true" data-copy-slot="t194">↗</span>',
  )
  .attr("data-track", "consultation_click")
  .attr("data-hub", "form");
$("main").wrapInner('<div class="connected-home"></div>');
// Re-running this builder should not nest the scope wrapper.
$(".connected-home .connected-home").each((_, el) => {
  $(el).replaceWith($(el).contents());
});
$("link[rel=stylesheet]")
  .last()
  .after('<link rel="stylesheet" href="connected-home.css">');
$("script").remove();
// A text-led hero and original flowing colour field, closer to the reference's composition.
$(".connected-visual").replaceWith('<div class="spectrum-field" aria-hidden="true"><div class="spectrum-ribbon"></div><div class="spectrum-thread"></div></div>');
$(".hero-copy h1").html('<span data-copy-slot="t1">Your next big idea.</span> <span data-copy-slot="t2">Connected by technology.</span> <span class="hero-accent" data-copy-slot="t3">Built for your business.</span>');
$(".hero-copy .intro").attr("data-copy-slot", "t4").text('Turn a business challenge into software that moves you forward. We bring custom development, mobile, AI and cloud together — with a clear path from the first conversation to the build.');
$(".hero-copy .eyebrow").attr("data-copy-slot", "t0").text('Netofficials / Your development partner');
$(".hero-copy h1 br").remove();
for (const hub of hubs) {
  $(`.hub-card[data-hub='${hub.id}']>p`).after(`<div class="hub-topics" aria-label="Project possibilities">${hub.links.slice(0,4).map(([label])=>`<span>${label}</span>`).join("")}</div>`);
}
$(".business-paths").remove();
$("#work").before(`<section class="section wrap business-paths"><div class="section-head"><div><div class="eyebrow">START WITH THE OPPORTUNITY</div><h2>What could work better?<br><span>Let's build from there.</span></h2></div><p>Technology earns its place when it solves a real problem. These are useful starting points for your project conversation.</p></div><div class="opportunity-grid"><article>${icon("software")}<h3>Less manual work.</h3><p>Move from spreadsheets and disconnected tools to a shared workflow. Map the bottleneck, connect the data and give your team a clearer way to work.</p><span>Custom software · Integrations · Automation</span></article><article>${icon("mobile")}<h3>A better customer experience.</h3><p>Make a frequent task easier: ordering, booking, tracking or getting support. Shape an application around the moments your customers need you.</p><span>Web applications · Mobile apps · AI assistants</span></article><article>${icon("cloud")}<h3>Room for your next stage.</h3><p>Prepare an existing product for new features, users or connected services. Review the foundations before adding the next layer.</p><span>Modernization · Cloud · DevOps</span></article></div><a class="text-cta" href="#contact" data-track="consultation_click" data-hub="opportunities">Tell us what you want to improve ${arrow}</a></section>`);
$(".contact-grid>div:first-child>p").text('Tell us what you want to build, what is slowing you down, or what your next stage needs. A short description is enough to begin.');
$(".contact-note").html('<strong>One conversation. A clearer starting point.</strong><span>Share your goal, current tools and must-have requirements. Our team will follow up to discuss your project and the next steps.</span>');
const buyerFAQs = [
  ["Do I need a finished specification to start?", "No. Begin with the problem, the people affected and the outcome you want. Share any existing tools, constraints or ideas; the first conversation helps identify what needs to be defined."],
  ["Can you improve a product we already have?", "Tell us how your current application works and where it falls short. We can discuss integrations, new features, modernization or a migration, then decide what needs further technical review."],
  ["How do we decide what to build first?", "Start with the most important user workflow and the business problem it addresses. Discuss must-have requirements, dependencies and success criteria before expanding the scope."],
  ["Where should AI fit in our business?", "Look for a specific task with repetitive work or useful information that is difficult to find. Discuss the data, review requirements and practical constraints before choosing an AI approach."],
  ["What affects the cost and timeline?", "Scope, platform choices, integrations, existing systems and review requirements all affect the work. Share these details so the conversation can move toward a realistic project scope."],
];
$(".faqs details").each((index, element)=>{
  const entry=buyerFAQs[index];
  if(!entry)return;
  const summary=$(element).find("summary");
  summary.html(`<span data-copy-slot="t${155+index*4}">${entry[0]}</span>`);
  $(element).find("p").first().attr("data-copy-slot",`t${158+index*4}`).text(entry[1]);
});
$("a[href='#contact']").attr("data-track", "consultation_click");
// Editorial revision: name the work and remove repeated slogan-style sections.
$(".hero-copy h1").html('<span data-copy-slot="t1">Custom software.</span> <span data-copy-slot="t2">Mobile applications.</span> <span class="hero-accent" data-copy-slot="t3">Built around your business.</span>');
$(".hero-copy .intro").text('Build a new product, replace a manual process, or improve the systems you already use. Netofficials brings software development, mobile, AI and cloud into one project conversation.');
$(".hero-copy .eyebrow").text('Software development partner · India');
$(".spectrum-field").replaceWith(`<div class="engineering-map" role="img" aria-label="Concept diagram connecting business workflows with software, mobile applications, AI and cloud"><svg viewBox="0 0 420 400" fill="none" aria-hidden="true"><path class="map-route" d="M75 80H215V150H345M75 200H215V280H345M75 320H150V200H215"/><circle cx="215" cy="200" r="44" fill="white" stroke="#4553b2" stroke-width="1.5"/><path d="M201 214v-28l28 28v-28" stroke="#4553b2" stroke-width="2.5" stroke-linecap="round"/><circle cx="75" cy="80" r="6" fill="#b9d725"/><circle cx="75" cy="200" r="6" fill="#4553b2"/><circle cx="75" cy="320" r="6" fill="#b9d725"/><circle cx="345" cy="150" r="6" fill="#4553b2"/><circle cx="345" cy="280" r="6" fill="#b9d725"/></svg><span class="map-label map-a">Your workflows</span><span class="map-label map-b">Your customers</span><span class="map-label map-c">Your data</span><span class="map-label map-d">Software + mobile</span><span class="map-label map-e">AI + cloud</span><span class="map-caption">Designed to work together</span></div>`);
$("#services .section-head h2").html('<span data-copy-slot="t18">Development services</span><br><span data-copy-slot="t19">for the work ahead.</span>');
$("#services .section-head>p").text('Choose a specialist service or discuss a project that spans several. Start with the problem you need to solve.');
$(".hub-number").each((index,el)=>{ $(el).text(index<4?`0${index+1} / DEVELOPMENT`:`0${index+1} / SUPPORTING SERVICES`); });
$(".icon-orbit,.icon-spark").remove();
$(".project-fit").remove();
$(".business-paths .section-head h2").html('Common problems.<br><span>Practical starting points.</span>');
$(".business-paths .section-head>p").text('These examples show how a project can begin. The right scope depends on your users, existing systems and constraints.');
const examples=[
 ['Orders spread across spreadsheets','Connect orders, stock and customer records in one application. Start by mapping who updates each record and where mistakes or delays occur.','ERP / CRM · APIs · Internal applications'],
 ['Customers need a simpler way to use your service','Build an app for repeat tasks such as booking, ordering or tracking. Define the essential journey before adding more features.','Android / iOS · Cross-platform · Web applications'],
 ['Documents and routine tasks take too much time','Explore document processing, knowledge search or workflow automation. Review the source data and decide where a person should check the result.','AI integrations · Knowledge assistants · Automation']
];
$(".opportunity-grid article").each((index,el)=>{const entry=examples[index];$(el).find('h3').text(entry[0]);$(el).find('p').text(entry[1]);$(el).children('span').text(entry[2]);});
$("#work .section-head h2").html('Define the project<br><span>before the development.</span>');
$("#work .section-head>p").text('Agree what the application needs to do, how progress will be reviewed and what the handover includes. These details belong in the project scope.');
$("#approach h2").html('How the work is planned<br><span>and reviewed.</span>');
$("#questions h2").html('Questions before<br><span>starting a project.</span>');
$(".contact-grid h2").html('Tell us what<br><span>you need to build.</span>');
$(".hub-help strong").text('Not sure which service fits?');
$(".hub-help p").text('Describe the problem and the systems involved. We can discuss where to start.');
fs.writeFileSync(file, $.html());
// Hero-only art direction: a bold statement and an original brand emblem.
$(".hero-copy h1").html('<span data-copy-slot="t1">Software for</span> <span data-copy-slot="t2">your business.</span> <span class="hero-accent" data-copy-slot="t3">From idea to application.</span>');
$(".hero-copy .intro").text('Custom software and mobile applications that fit how you work. Bring us your product idea or business problem — we’ll discuss the software, AI and cloud your project needs.');
$(".hero-copy .eyebrow").text('CUSTOM SOFTWARE · MOBILE · AI · CLOUD');
$(".engineering-map,.hero-emblem").replaceWith(`<div class="hero-emblem" role="img" aria-label="Original Netofficials emblem representing connected software development"><svg viewBox="0 0 460 460" fill="none" aria-hidden="true"><circle cx="230" cy="230" r="194" stroke="#4553b2" stroke-opacity=".18"/><circle cx="230" cy="230" r="158" stroke="#4553b2" stroke-opacity=".3" stroke-dasharray="2 8"/><path d="M70 345 385 115" stroke="#95a82e" stroke-width="1.5" stroke-dasharray="7 9"/><circle cx="230" cy="230" r="112" fill="#4553b2"/><path d="M171 286V174l118 112V174" stroke="white" stroke-width="21" stroke-linecap="square"/><path d="m184 286 106-112" stroke="#c5df48" stroke-width="11"/><circle cx="88" cy="334" r="8" fill="#b9d725"/><circle cx="374" cy="124" r="8" fill="#b9d725"/><path d="M230 20v28M230 412v28M20 230h28M412 230h28" stroke="#4553b2" stroke-opacity=".4"/></svg><span class="emblem-label label-top">PRODUCT ENGINEERING</span><span class="emblem-label label-bottom">NETOFFICIALS</span><span class="emblem-side">BUILT TO CONNECT</span></div>`);
$(".hero-copy h1").html('<span data-copy-slot="t1">Custom software.</span> <span data-copy-slot="t2">Mobile applications.</span> <span class="hero-accent" data-copy-slot="t3">Built around your business.</span>');
$(".hero-copy .intro").text('Develop a new product, improve an existing application, or automate the work between your systems. Talk to Netofficials about the software, mobile, AI and cloud your project needs.');
$(".hero-copy .eyebrow").text('NETOFFICIALS / SOFTWARE DEVELOPMENT PARTNER');
$(".hero-emblem").replaceWith(`<div class="hero-flow" aria-hidden="true"><svg viewBox="0 0 1200 800" fill="none" preserveAspectRatio="xMidYMid slice"><defs><linearGradient id="hero-purple" x1="150" y1="0" x2="900" y2="550" gradientUnits="userSpaceOnUse"><stop stop-color="#dce9ff"/><stop offset=".5" stop-color="#afaeea"/><stop offset="1" stop-color="#ebcce2"/></linearGradient><linearGradient id="hero-lime" x1="550" y1="0" x2="1050" y2="600" gradientUnits="userSpaceOnUse"><stop stop-color="#eef2d3"/><stop offset=".55" stop-color="#d8e795"/><stop offset="1" stop-color="#f8e8cd"/></linearGradient></defs><path d="M350-180C80 140 490 630 1240 410L1320 250C660 465 310 155 525-120Z" fill="url(#hero-purple)"/><path d="M565-160C420 130 730 465 1280 265L1340 125C855 340 590 85 745-160Z" fill="url(#hero-lime)"/><path d="M350-180C80 140 490 630 1240 410" stroke="white" stroke-opacity=".5"/><path d="M370-170C120 140 510 595 1260 385M390-160C150 140 530 565 1270 355M410-150C180 140 555 540 1280 325" stroke="white" stroke-opacity=".25"/></svg></div>`);
fs.writeFileSync(file, $.html());
$("#services .section-head .eyebrow").text('OUR DEVELOPMENT SERVICES');
$("#services .section-head h2").html('<span data-copy-slot="t18">What do you</span><br><span data-copy-slot="t19">need to build?</span>');
$("#services .section-head>p").text('A product for your customers. A system for your team. An integration that removes manual work. Explore the services below, or tell us what you have in mind.');
$(".capability-strip>span").text('YOUR PROJECT. THE RIGHT EXPERTISE.');
const serviceSketches: Record<string,string> = {
 software: '<rect x="42" y="35" width="176" height="113" rx="7"/><path d="M42 57h176m-139 37-15 12 15 12m54-24 15 12-15 12m-29-29-9 34"/><path class="sketch-route" d="M218 105h35v64H111v-21"/><rect class="sketch-lime" x="192" y="152" width="73" height="42" rx="5"/><circle cx="60" cy="46" r="2"/><circle cx="69" cy="46" r="2"/><path d="M201 164h18m-18 8h39m-39 8h25"/>',
 mobile: '<g transform="rotate(-8 135 110)"><rect x="89" y="17" width="87" height="169" rx="14"/><path d="M119 28h27m-21 146h16"/><rect class="sketch-lime" x="102" y="48" width="61" height="42" rx="5"/><path d="M104 108h57m-57 13h39m-39 13h49"/></g><path class="sketch-route" d="M192 61c27 20 28 69 0 91m14-109c43 31 44 89 0 127"/><circle class="sketch-dot" cx="59" cy="103" r="6"/>',
 ai: '<rect x="28" y="72" width="55" height="70" rx="5"/><path d="M40 91h31m-31 11h31m-31 11h20"/><path class="sketch-route" d="M83 106h36m46 0h37"/><path class="sketch-lime" d="m142 66 11 27 29 13-29 12-11 28-12-28-28-12 28-13Z"/><circle cx="230" cy="106" r="28"/><path d="m218 106 9 9 16-20"/><path class="sketch-route" d="M142 66V30h89v48M142 146v42H54v-46"/><circle class="sketch-dot" cx="142" cy="30" r="4"/>',
 cloud: '<path d="M64 87a25 25 0 0 1 8-49 35 35 0 0 1 65 0 25 25 0 0 1 8 49H64Z"/><path class="sketch-route" d="M104 87v35h118v25m-118-25H52v25"/><rect x="25" y="147" width="55" height="36" rx="5"/><rect class="sketch-lime" x="195" y="147" width="55" height="36" rx="5"/><path d="M36 161h31m-31 10h18m153-10h31m-31 10h18M178 38h72m-72 12h49"/><circle class="sketch-dot" cx="167" cy="43" r="4"/>',
};
for(const [hub,paths] of Object.entries(serviceSketches)) {
 const card=$(`.hub-card[data-hub='${hub}']`);
 card.find('.hub-art').html(`<svg class="service-sketch" viewBox="0 0 290 220" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths}</svg>`);
 card.find('.hub-number').html(`<span class="service-index">0${hubs.findIndex(h=>h.id===hub)+1}</span><span>DEVELOPMENT EXPERTISE</span>`);
}
fs.writeFileSync(file, $.html());
fs.copyFileSync(
  "public/assets/connected-home.css",
  "homepage-concept/connected-home.css",
);
console.log(
  "Connected homepage source updated; run npm run design:import to refresh templates.",
);


