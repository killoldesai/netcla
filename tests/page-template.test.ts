import test from 'node:test';
import assert from 'node:assert/strict';
import {loadSpecifications} from '../src/page-spec-import';
import {templateBlueprint} from '../src/page-template';
test('all specifications resolve to deterministic component-owned layouts',async()=>{
 const input=await loadSpecifications();
 for(const spec of input.pages){const blueprint=templateBlueprint(spec);assert.equal(Object.keys(blueprint).length,spec.sections.length);assert.deepEqual(blueprint,templateBlueprint(spec));assert.ok(['HeroFull','HeroSplit'].includes(blueprint.hero.recommended_component));if(blueprint['cta-banner'])assert.equal(blueprint['cta-banner'].recommended_component,'DarkCtaBand');}
});
