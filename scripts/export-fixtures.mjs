import {writeFileSync,mkdirSync} from 'node:fs';
import {VERSION,CASES,MODES,generate,groupRows,fit,profile} from '../web/engine.js';
const fixtures=CASES.map(c=>{
  const rows=generate(c.id),groups=groupRows(rows);
  const fits=Object.keys(MODES).map(mode=>fit(groups,mode));
  const p=profile(groups,fits[0]);
  const selected=[.2,.4,.6,.8].map(q=>p.points[Math.floor(q*(p.points.length-1))]);
  return {id:c.id,rows,groups,fits,profileChecks:selected};
});
mkdirSync('results',{recursive:true});
writeFileSync('results/reference.json',JSON.stringify({version:VERSION,seed:42,fixtures},null,2)+'\n');
console.log(`Exported ${fixtures.length} cases and ${fixtures.length*4} fitted models.`);
