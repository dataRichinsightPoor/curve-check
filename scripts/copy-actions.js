const body=document.getElementById('copyBody');
const status=document.getElementById('copyStatus');
function selectArticle(){
  const range=document.createRange();range.selectNodeContents(body);
  const selection=getSelection();selection.removeAllRanges();selection.addRange(range);
}
function payload(){
  const text=body.cloneNode(true);
  text.querySelectorAll('[data-math],[data-math-inline]').forEach(el=>el.replaceWith(document.createTextNode('\\('+(el.dataset.tex||el.alt)+'\\)')));
  text.querySelectorAll('a').forEach(a=>a.append(' ('+a.href+')'));
  text.querySelectorAll('br').forEach(br=>br.replaceWith('\n'));
  text.querySelectorAll('p,h1,h2,h3,figcaption,.math-block').forEach(el=>el.append('\n\n'));
  return {html:body.outerHTML,plain:text.textContent};
}
document.getElementById('selectComplete').addEventListener('click',()=>{
  selectArticle();status.textContent='Complete article selected. Press Ctrl+C or ⌘C, then paste into your editor.';
});
document.getElementById('copyComplete').addEventListener('click',async()=>{
  const content=payload();selectArticle();
  let copied=false;
  const nativeCopy=event=>{
    if(!event.clipboardData)return;
    event.clipboardData.setData('text/html',content.html);
    event.clipboardData.setData('text/plain',content.plain);
    event.preventDefault();
  };
  document.addEventListener('copy',nativeCopy);
  try{copied=document.execCommand('copy');}catch{}
  finally{document.removeEventListener('copy',nativeCopy);}
  if(!copied&&navigator.clipboard?.write&&window.ClipboardItem){
    try{
      await navigator.clipboard.write([new ClipboardItem({
        'text/html':new Blob([content.html],{type:'text/html'}),
        'text/plain':new Blob([content.plain],{type:'text/plain'})
      })]);copied=true;
    }catch{}
  }
  status.textContent=copied
    ?'Complete article copied. Paste into your editor. If it drops images, use the individual downloads above.'
    :'Complete article selected. Automatic copy is blocked here: press Ctrl+C or ⌘C, then paste. You can also download and open the HTML in Chrome.';
});
document.getElementById('downloadHTML').addEventListener('click',()=>{
  const copy=document.documentElement.cloneNode(true);
  copy.querySelector('#copyStatus').textContent='Use Copy complete article, or select and copy normally.';
  copy.querySelector('#imageDownloads').replaceChildren();
  const url=URL.createObjectURL(new Blob(['<!doctype html>\n'+copy.outerHTML],{type:'text/html;charset=utf-8'}));
  const a=document.createElement('a');a.href=url;a.download='Is-It-a-Curve-Copy-Ready.html';a.click();
  setTimeout(()=>URL.revokeObjectURL(url),2000);
});
document.getElementById('imageDownloads').replaceChildren();
body.querySelectorAll('img:not([data-math])').forEach((img,index)=>{
  const a=document.createElement('a');a.href=img.src;a.download=index?'Curve-Check-Figure-'+index+'.png':'Curve-Check-Cover.png';
  a.textContent=index?'Figure '+index:'Cover';document.getElementById('imageDownloads').append(a);
});
body.querySelectorAll('img[data-math]').forEach((img,index)=>{
  const a=document.createElement('a');a.href=img.src;a.download='Curve-Check-Equation-'+(index+1)+'.png';
  a.textContent='Equation '+(index+1);document.getElementById('imageDownloads').append(a);
});
