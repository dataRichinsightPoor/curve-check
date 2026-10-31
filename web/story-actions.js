const $=id=>document.getElementById(id);
$('downloadArticle').addEventListener('click',async()=>{
  try{
    const response=await fetch('article.md');if(!response.ok)throw Error('Article unavailable');
    const url=URL.createObjectURL(new Blob([await response.text()],{type:'text/markdown;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download='Is-It-a-Curve-and-Can-We-Report-the-IC50.md';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
    $('copyStatus').textContent='Markdown downloaded. Read the illustrated version here or in the repository.';
  }catch{$('copyStatus').textContent='Download unavailable. Select and copy the article below.';}
});
$('copyArticle').addEventListener('click',async()=>{
  const body=$('articleBody');
  try{
    const plain=body.cloneNode(true),rich=body.cloneNode(true);
    for(const root of [plain,rich]){root.querySelectorAll('.no-copy').forEach(e=>e.remove());root.querySelectorAll('a[href^="figures/"]').forEach(e=>e.remove());}
    plain.querySelectorAll('.katex').forEach(el=>el.replaceWith(document.createTextNode(`\\(${el.querySelector('annotation')?.textContent||el.textContent}\\)`)));
    plain.querySelectorAll('a').forEach(a=>a.append(` (${a.href})`));
    plain.querySelectorAll('br').forEach(el=>el.replaceWith(document.createTextNode('\n')));
    plain.querySelectorAll('p,h1,h2,h3,figcaption,.math-block').forEach(el=>el.append('\n\n'));
    rich.querySelectorAll('.katex').forEach(el=>{const math=el.querySelector('math')?.cloneNode(true);if(math){math.querySelectorAll('annotation').forEach(e=>e.remove());el.replaceWith(math);}});
    rich.querySelectorAll('a').forEach(a=>a.href=new URL(a.getAttribute('href'),location.href).href);
    const html=async()=>{
      for(const img of rich.querySelectorAll('img')){
        const r=await fetch(img.getAttribute('src'));if(!r.ok)throw Error('Figure unavailable');
        const url=URL.createObjectURL(await r.blob());
        try{const image=new Image();image.crossOrigin='anonymous';image.src=url;await image.decode();const canvas=document.createElement('canvas');canvas.width=image.naturalWidth;canvas.height=image.naturalHeight;canvas.getContext('2d').drawImage(image,0,0);img.src=canvas.toDataURL('image/png');img.style.maxWidth='100%';img.style.height='auto';}finally{URL.revokeObjectURL(url);}
      }
      return new Blob([rich.innerHTML],{type:'text/html'});
    };
    if(navigator.clipboard.write&&window.ClipboardItem)await navigator.clipboard.write([new ClipboardItem({'text/html':html(),'text/plain':new Blob([plain.textContent],{type:'text/plain'})})]);
    else await navigator.clipboard.writeText(plain.textContent);
    $('copyStatus').textContent='Copied with embedded figures, MathML, and linked references. Plain text retains TeX. Destination-editor formatting may vary.';
  }catch{const range=document.createRange();range.selectNodeContents(body);const s=getSelection();s.removeAllRanges();s.addRange(range);$('copyStatus').textContent='Article selected. Use your browser’s Copy command, or download Markdown.';}
});
