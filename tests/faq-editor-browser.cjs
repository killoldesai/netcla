const assert = require('node:assert/strict');
const {chromium} = require('@playwright/test');
(async()=>{
 const browser=await chromium.launch({executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',headless:true});
 try {
  const p=await browser.newPage({viewport:{width:1440,height:1000}});
  await p.goto(process.env.SITE_URL+'/admin/login');await p.locator('[name=email]').fill(process.env.OWNER_EMAIL);await p.locator('[name=password]').fill(process.env.OWNER_PASSWORD);await p.getByRole('button',{name:'Sign in',exact:true}).click();await p.waitForURL('**/admin');
  await p.route('**/api/admin*',async route=>{if(route.request().method()==='POST')throw new Error('FAQ browser verification must not save or generate');await route.continue();});
  await p.getByRole('navigation',{name:'Admin sections'}).getByRole('button',{name:'Content',exact:true}).click();
  await p.getByRole('row').filter({has:p.getByText('/ai-automation-services',{exact:true})}).getByRole('button').click();
  const section=p.locator('details.editor-section-card').filter({has:p.locator('summary').filter({hasText:'Frequently Asked Questions'})});
  await section.locator(':scope > summary').click();
  await section.getByText('Questions & answers',{exact:true}).waitFor();
  assert.equal(await section.locator('.editor-faq-pair').count(),5);
  await section.getByLabel('Question 1',{exact:true}).fill('Edited question in browser only?');
  assert.equal(await section.getByLabel('Question 1',{exact:true}).inputValue(),'Edited question in browser only?');
  await section.getByRole('button',{name:'Add FAQ',exact:true}).click();assert.equal(await section.locator('.editor-faq-pair').count(),6);
  await section.getByRole('button',{name:'Remove question 6',exact:true}).click();assert.equal(await section.locator('.editor-faq-pair').count(),5);
  await p.setViewportSize({width:390,height:844});
  assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
  console.log('Five stored FAQs visible and editable; add/remove and mobile layout passed. No content writes or AI calls made.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e.message);process.exitCode=1;});
