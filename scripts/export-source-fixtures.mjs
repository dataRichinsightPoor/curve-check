import {writeFileSync} from 'node:fs';
import {weakSignalDemo,sourceDemo,reconstruct,signalAudit} from '../web/source-engine.js';
import {audit,VERSION} from '../web/engine.js';
const fixtures=[['weak',weakSignalDemo(20,20)],['clear',weakSignalDemo(20,1)],['flat',weakSignalDemo(0,20)],['tiny',sourceDemo()],['constant',weakSignalDemo(0,0)]].map(([name,raw])=>{
 const r=reconstruct(raw),a=audit(r.variants.control,'free',false);
 return {name,raw,control:r.variants.control,signal:signalAudit(r.variants.control,a.fit),fit:a.fit};
});
writeFileSync('results/source-reference.json',JSON.stringify({version:VERSION,fixtures},null,2)+'\n');
