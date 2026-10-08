import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSpecifications} from '../src/page-spec-import';
import {validateSectionFields,iconKeys} from '../src/page-spec-schema';
import {buildSectionPrompt} from '../src/prompts/sections';
import {pageBriefSchema} from '../src/prompts/page-brief';
test('generation receives exact sprite keys and safely canonicalizes API aliases',async()=>{
 const specs=await loadSpecifications();
 const section=specs.pages.find(p=>p.path==='/python-development-services')!.sections.find(s=>s.id==='what-we-deliver')!;
 const page=specs.pages.find(p=>p.path==='/python-development-services')!;
 const brief=pageBriefSchema.parse({audience:'CTOs',primaryKeyword:'python development services',secondaryKeywords:[],entities:[],buyerQuestions:[],angle:'',metaTitle:'',metaDescription:''});
 const prompt=JSON.parse(buildSectionPrompt({spec:page,section,brief,links:[],facts:[]}));
 assert.deepEqual(prompt.approvedIconKeys,iconKeys);
 const key=section.fields.find(k=>k.endsWith('icon_key'))!;
 const fields=Object.fromEntries(section.fields.map(k=>[k,'']));
 assert.equal(validateSectionFields(section,{...fields,[key]:'web-api'},[])[key],'api-plug');
 assert.throws(()=>validateSectionFields(section,{...fields,[key]:'invented-icon'},[]),/Unknown icon/);
 assert.throws(()=>validateSectionFields(section,{...fields,[key]:'<script>bad</script>'},[]),/Markup/);
});
