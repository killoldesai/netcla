import React from 'react';
import test from 'node:test';
import assert from 'node:assert/strict';
import {renderToStaticMarkup} from 'react-dom/server';
import {load} from 'cheerio';
import {loadSpecifications} from '../src/page-spec-import';
import {V3Page} from '../src/v3-page';
import {contentSchema} from '../src/content';
test('all reconciled CSV prose fields survive rendering, including model bodies and pairing reasons',async()=>{
 const specs=await loadSpecifications();
 for(const spec of specs.pages){
  const content=contentSchema.parse({schemaVersion:3,title:spec.title,description:'A complete test description for rendering.',texts:{},pageBlueprint:Object.fromEntries(spec.sections.map(s=>[s.id,{recommended_component:s.id==='hero'?'HeroFull':'CardGrid3Col',background:'#ffffff',spacing_above:0,max_width:'1320px',mobile_stack:'Stack'}])),pageSections:spec.sections.map(s=>({id:s.id,order:s.order,fields:Object.fromEntries(s.fields.map(k=>[k,k.endsWith('_url')?'/contact':k.endsWith('_icon_key')?'code-brackets':`Content-${s.id}-${k}`]))}))});
  const $=load(renderToStaticMarkup(<V3Page content={content} path={spec.path} paths={[]}/>));
  for(const section of spec.sections){
   if(['open-roles','contact-form','newsletter-cta'].includes(section.id))continue;
   for(const field of section.fields.filter(k=>/(?:_body|_bio|_problem|_outcome|_reason|_usecase|_excerpt)$/.test(k)))assert.ok($('main').text().includes(`Content-${section.id}-${field}`),`${spec.path} / ${section.id} drops ${field}`);
  }
 }
});
test('regeneration sends exact fields, the brief and the previous copy',async()=>{
 const {buildSectionPrompt}=await import('../src/prompts/sections');
 const {pageBriefSchema}=await import('../src/prompts/page-brief');
 const specs=await loadSpecifications();const page=specs.pages.find(p=>p.path==='/flutter-app-development')!;const section=page.sections.find(s=>s.id==='service-overview')!;
 const brief=pageBriefSchema.parse({audience:'Founders',primaryKeyword:'flutter app development services',secondaryKeywords:['flutter developers'],entities:['Dart'],buyerQuestions:['How long does a Flutter app take?'],angle:'One codebase',metaTitle:'Flutter App Development Services',metaDescription:'x'});
 const request=JSON.parse(buildSectionPrompt({spec:page,section,brief,links:[{path:'/contact',label:'Contact',blurb:''}],facts:[],previous:{body_paragraph:'Previous draft'}}));
 assert.deepEqual(request.exactFields,section.fields);assert.equal(request.previousVersion.body_paragraph,'Previous draft');assert.equal(request.strategy.primaryKeyword,'flutter app development services');assert.match(request.fieldRules.join(" "),/Paragraph 1 is 40-55 words and is the direct answer/);assert.match(request.regeneration,/substantively/);
});

test('brief and unchanged copy produces suggestions rather than publication errors', async()=>{
 const {sectionContentWarnings}=await import('../src/page-spec-schema');
 const specs=await loadSpecifications();const section=specs.pages.find(p=>p.path==='/flutter-app-development')!.sections.find(s=>s.id==='service-overview')!;
 const fields={body_paragraph:'A short unchanged overview.'};
 const warnings=sectionContentWarnings(section,fields,fields);
 assert.equal(warnings.length,2);assert.match(warnings[0],/unchanged/);assert.match(warnings[1],/brief copy/);
});
