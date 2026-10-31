import {audit,leaveOneDoseOut} from './engine.js';
self.onmessage=({data})=>{
  try {self.postMessage({id:data.id,type:data.type,result:data.type==='loo'?leaveOneDoseOut(data.rows,data.mode):audit(data.rows,data.mode,data.controlsValid)});}
  catch(e){self.postMessage({id:data.id,error:e.message});}
};
