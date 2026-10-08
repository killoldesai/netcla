const { chromium } = require("@playwright/test");
const { build } = require("esbuild");
const fs = require("node:fs");
const assert = require("node:assert/strict");
(async () => {
  const bundle = await build({
    stdin: {
      contents: `
    import React,{useState} from 'react'; import {createRoot} from 'react-dom/client';
    import {StructuredEditor} from './src/structured-editor'; import {ContentField} from './src/rich-text-editor';
    import {PlannedContent} from './src/planned-content'; import {normalizeRichContent} from './src/rich-text';
    const initial={title:'Service page',description:'Service details.',texts:{body:'Legacy body'},sources:[],claims:[],unresolved:[],hiddenSections:[],schemaVersion:2,hero:{heading:'Service page',body:'Opening answer',ctaLabel:'Contact us',ctaPath:'/contact'},sections:[{id:'section-1',level:2,heading:'Service details',paragraphs:['Original paragraph'],items:['Original item'],cards:[{title:'Card title',body:'Card body'}],table:{columns:['Feature'],rows:[['Cell']]},faqs:[{question:'How does it work?',answer:'Original answer'}],links:[{label:'Contact us',path:'/contact'}]}]};
    function App(){const [content,setContent]=useState(initial);const [saved,setSaved]=useState(null);const [version,setVersion]=useState(0);return <><h1>Content editor</h1><button onClick={()=>{const next=normalizeRichContent(content);setSaved(next);window.savedContent=next;}}>Save draft</button><button disabled={!saved} onClick={()=>{setContent(saved);setVersion(v=>v+1);}}>Reopen saved draft</button><div key={version}><StructuredEditor content={content} change={setContent} regenerate={()=>{}} busy={false}/><ContentField label="Legacy body" content={content} value={content.texts.body} field="texts.body" change={(text,richText)=>setContent({...content,richText,texts:{body:text}})}/></div>{saved&&<div id="preview"><PlannedContent content={saved}/></div>}</>};createRoot(document.getElementById('root')).render(<App/>);
  `,
      resolveDir: process.cwd(),
      loader: "tsx",
    },
    bundle: true,
    write: false,
    platform: "browser",
    format: "iife",
    jsx: "automatic",
    define: { "process.env.NODE_ENV": '"production"' },
  });
  const browser = await chromium.launch({ channel: "chrome", headless: true });
  try {
    const page = await browser.newPage({
      viewport: { width: 1440, height: 1000 },
    });
    const errors = [];
    page.on("pageerror", (e) => errors.push(e.message));
    await page.route("http://editor.test/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: `<style>${fs.readFileSync("app/globals.css", "utf8").replace(/^@import.*$/gm, "")}\n${fs.readFileSync("app/admin.css", "utf8")}</style><main class="admin"><div class="workspace" style="display:block"><div class="workspace-body" style="max-width:1000px;margin:auto;padding:16px"><div class="page-editor" id="root"></div></div></div></main><script>${bundle.outputFiles[0].text.replace(/<\/script/gi, "<\\/script")}</script>`,
      }),
    );
    await page.goto("http://editor.test/");
    await page.locator(".editor-section-card > summary").click();
    const field = (name) =>
      page
        .locator(".rich-editor")
        .filter({
          has: page.locator(".rich-editor-label", {
            hasText: new RegExp(`^${name}$`),
          }),
        });
    const textbox = (name) => field(name).getByRole("textbox");
    await textbox("Section content").fill("");
    await textbox("Section content").evaluate((el) => {
      el.focus();
      const data = new DataTransfer();
      data.setData(
        "text/html",
        '<h2>Pasted heading</h2><p><strong>Formatted copy</strong> with <em>emphasis</em> and <a href="https://example.com">a link</a>.</p><ul><li>First point</li><li>Second point</li></ul>',
      );
      data.setData(
        "text/plain",
        "Pasted heading\nFormatted copy with emphasis and a link.\nFirst point\nSecond point",
      );
      el.dispatchEvent(
        new ClipboardEvent("paste", {
          clipboardData: data,
          bubbles: true,
          cancelable: true,
        }),
      );
    });
    await textbox("Section content").locator("strong").waitFor();
    assert.equal(await textbox("Section content").locator("li").count(), 2);
    await textbox("Answer 1").fill("Updated answer");
    await textbox("Answer 1").press("ControlOrMeta+a");
    await field("Answer 1")
      .getByRole("button", { name: "Bold", exact: true })
      .click();
    assert.equal(
      await textbox("Answer 1").locator("strong").innerText(),
      "Updated answer",
    );
    await field("Card 1 body")
      .getByRole("button", { name: "Paste HTML", exact: true })
      .click();
    await field("Card 1 body")
      .locator("textarea")
      .fill('<p><u>Inserted HTML</u><script>alert("unsafe")</script></p>');
    await field("Card 1 body")
      .getByRole("button", { name: "Insert HTML", exact: true })
      .click();
    await textbox("Card 1 body").locator("u").waitFor();
    await textbox("Legacy body").fill("Legacy formatted content");
    await textbox("Legacy body").press("ControlOrMeta+a");
    await field("Legacy body")
      .getByRole("button", { name: "Italic", exact: true })
      .click();
    await textbox("Opening answer").click();
    await field("Opening answer")
      .getByRole("button", { name: "Insert table", exact: true })
      .click();
    assert.equal(await textbox("Opening answer").locator("table").count(), 1);
    await field("Opening answer")
      .getByRole("button", { name: "Delete table", exact: true })
      .click();
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    const saved = await page.evaluate(() => window.savedContent);
    assert.match(
      saved.richText["sections.section-1.paragraphs"].html,
      /<strong>Formatted copy<\/strong>/,
    );
    assert.match(
      saved.richText["sections.section-1.faqs.0.answer"].html,
      /<strong>Updated answer<\/strong>/,
    );
    assert.doesNotMatch(JSON.stringify(saved), /<script|unsafe/);
    assert.equal(
      await page
        .locator("#preview strong")
        .filter({ hasText: "Formatted copy" })
        .count(),
      1,
    );
    await page
      .getByRole("button", { name: "Reopen saved draft", exact: true })
      .click();
    await page.locator(".editor-section-card > summary").click();
    assert.equal(
      await textbox("Section content").locator("strong").innerText(),
      "Formatted copy",
    );
    assert.equal(
      await textbox("Legacy body").locator("em").innerText(),
      "Legacy formatted content",
    );
    // Plain typing after reopening must retain every character and dirty updates.
    await textbox("Section content").press("ControlOrMeta+End");
    await textbox("Section content").press("Enter");
    await textbox("Section content").pressSequentially(
      "New text after reopening",
    );
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    assert.match(
      (
        await page.evaluate(() => window.savedContent)
      ).sections[0].paragraphs.join(" "),
      /New text after reopening/,
    );
    await page.screenshot({
      path: "tests/rich-editor-desktop.png",
      fullPage: false,
    });
    await page.setViewportSize({ width: 390, height: 844 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
    );
    await page.screenshot({
      path: "tests/rich-editor-mobile.png",
      fullPage: false,
    });
    assert.deepEqual(errors, []);
    console.log(
      "Formatted clipboard paste, toolbar actions, HTML insertion, tables, save/reopen, preview, legacy content and mobile layout passed.",
    );
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
