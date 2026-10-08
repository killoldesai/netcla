import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {parse} from 'csv-parse/sync';
import pg from 'pg';

const samplePath='research docs/revised-seo-plan/page-and-content-plan.csv';
const outputPath='research docs/revised-seo-plan/database-urls-and-content-prompts-2026-10-07.csv';
const headers=parse(fs.readFileSync(samplePath,'utf8'),{bom:true,to_line:1})[0];
const extraHeaders=['master_ai_prompt','latest_successful_generation_master_ai_prompt','generation_prompt_source','page_status','database_page_id','phase','generation_job_id','generation_section_id','generation_completed_at','generation_provider','generation_model'];
const columns=[...headers,...extraHeaders];
const client=new pg.Client({connectionString:process.env.DATABASE_URL,connectionTimeoutMillis:10000});
const cell=value=>value==null?'':Array.isArray(value)?value.map(cell).join('; '):typeof value==='object'?JSON.stringify(value):String(value);
const prompt=brief=>brief?.prompt??brief?.master_ai_prompt??'';
const csvCell=value=>'"'+cell(value).replaceAll('"','""')+'"';
try {
 await client.connect();
 await client.query('BEGIN ISOLATION LEVEL REPEATABLE READ READ ONLY');
 const {rows}=await client.query(`SELECT p.id,p.path,p.title,p.kind,p.brief,p.archived_at,p.draft_revision_id,p.published_revision_id,
 j.id AS job_id,j.brief_snapshot,j.section_id,j.updated_at AS generation_completed_at,j.provider,j.model
 FROM pages p LEFT JOIN LATERAL (
  SELECT id,brief_snapshot,section_id,updated_at,provider,model FROM jobs
  WHERE page_id=p.id AND status='completed'
  ORDER BY updated_at DESC,created_at DESC,id DESC LIMIT 1
 ) j ON true ORDER BY CASE WHEN p.path='/' THEN 0 ELSE 1 END,p.path`);
 const {rows:counts}=await client.query('SELECT count(*)::int AS total FROM pages');
 assert.equal(rows.length,counts[0].total);
 assert.equal(new Set(rows.map(p=>p.path)).size,rows.length);
 await client.query('ROLLBACK');
 const records=rows.map(p=>{
  const b=p.brief??{};
  const record=Object.fromEntries(headers.map(key=>[key,b[key]??'']));
  Object.assign(record,{
   page_id:b.page_id??p.id,url:p.path,proposed_title:b.proposed_title??b.title??p.title,
   page_type:b.page_type??b.pageType??p.kind,
   target_keyword_candidates:b.target_keyword_candidates??b.keywords??b.primaryKeyword??'',
   content_scope:b.content_scope??b.scope??'',publish_gate:b.publish_gate??b.publishGate??'',
   master_ai_prompt:prompt(b),
   latest_successful_generation_master_ai_prompt:prompt(p.brief_snapshot),
   generation_prompt_source:p.job_id?(prompt(p.brief_snapshot)?'Saved brief snapshot of latest completed generation':'Latest completed generation has no saved master prompt'):'No completed generation job recorded',
   page_status:p.archived_at?'archived':p.published_revision_id?'published':p.draft_revision_id?'draft':'no revision',
   database_page_id:p.id,phase:b.phase??'',generation_job_id:p.job_id??'',generation_section_id:p.section_id??'',
   generation_completed_at:p.generation_completed_at?.toISOString()??'',generation_provider:p.provider??'',generation_model:p.model??'',
  });
  return Object.fromEntries(columns.map(key=>[key,cell(record[key])]));
 });
 const csv='\uFEFF'+[columns.map(csvCell).join(','),...records.map(record=>columns.map(key=>csvCell(record[key])).join(','))].join('\r\n')+'\r\n';
 const roundTrip=parse(csv,{columns:true,bom:true});
 assert.deepEqual(roundTrip,records);
 fs.mkdirSync(path.dirname(outputPath),{recursive:true});
 fs.writeFileSync(outputPath,csv);
 const summary={exported_at:new Date().toISOString(),rows:rows.length,active:rows.filter(p=>!p.archived_at).length,archived:rows.filter(p=>p.archived_at).length,published_active:rows.filter(p=>!p.archived_at&&p.published_revision_id).length,current_prompts:records.filter(p=>p.master_ai_prompt).length,saved_generation_prompts:records.filter(p=>p.latest_successful_generation_master_ai_prompt).length,missing_current_prompts:records.filter(p=>!p.master_ai_prompt).map(p=>p.url),completed_generations_without_saved_prompt:records.filter(p=>p.generation_job_id&&!p.latest_successful_generation_master_ai_prompt).map(p=>p.url)};
 const notes=`# Database URL and prompt export\n\nExported on 7 October 2026 from a read-only, repeatable-read database transaction. No database records were changed.\n\n- Includes all ${summary.rows} page records: ${summary.active} active and ${summary.archived} archived. Redirect aliases are not page records and are not included.\n- The first ${headers.length} columns match the supplied sample, in the same order. Values come from each database page brief; unavailable fields are blank. Sample research values were not copied into unrelated database records.\n- \`page_id\` retains the stored planning ID where present; otherwise it uses the database UUID. \`database_page_id\` always contains the UUID.\n- \`master_ai_prompt\` is the current stored page brief prompt (${summary.current_prompts} present). It is not proof that this prompt was used for an earlier generation.\n- \`latest_successful_generation_master_ai_prompt\` is the master prompt retained in the latest completed generation job's brief snapshot (${summary.saved_generation_prompts} present). Blank means no historical master prompt was recoverable from that job; no replacement was invented.\n- A saved master prompt is the editorial brief, not the entire provider request. The worker builds an additional JSON request with design context, allowed links and output instructions; the complete historical request is not stored.\n- The latest successful generation may be a draft or a section update. \`generation_section_id\` identifies section-only jobs when present. It does not necessarily describe the currently published revision.\n- \`phase\` preserves the stored phase separately; a phase number is not converted into a day range. Dates in the generation column are UTC ISO timestamps.\n- CSV is UTF-8 with a BOM and supports multiline prompts. Re-parsing verified all ${summary.rows} URLs and every exported field exactly.\n\n## Summary\n\n\`\`\`json\n${JSON.stringify(summary,null,2)}\n\`\`\`\n`;
 fs.writeFileSync(outputPath.replace(/\.csv$/,'.md'),notes);
 console.log(JSON.stringify({file:outputPath,...summary},null,2));
} catch(e) { console.error('URL/prompt export failed: '+(e?.code??e?.name??'unknown error')); process.exitCode=1; }
finally {await client.end();}
