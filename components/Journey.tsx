'use client';

import { PointerEvent, useEffect, useRef, useState } from 'react';

type Step = 'landing'|'wish'|'transition'|'journey'|'memory'|'confirm'|'kept'|'given';
type Box = { x:number; y:number; width:number; height:number };
const landscape = '/landscape.svg';

export function Journey() {
  const [step,setStep] = useState<Step>('landing');
  const [wish,setWish] = useState('');
  const [line,setLine] = useState('');
  const [memoryLine,setMemoryLine] = useState('');
  const [box,setBox] = useState<Box|null>(null);
  const [sketch,setSketch] = useState('');
  const [shareId,setShareId] = useState('');
  const [busy,setBusy] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const start = useRef<{x:number;y:number}|null>(null);

  useEffect(() => {
    const kept = localStorage.getItem('somewhere:kept');
    if (kept) { try { const value=JSON.parse(kept); setSketch(value.image); setMemoryLine(value.line); } catch {} }
  },[]);

  async function ask(kind:'transition'|'memory', text:string) {
    try {
      const response=await fetch('/api/atmosphere',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind,text})});
      if (!response.ok) throw new Error();
      return (await response.json()).line as string;
    } catch { return kind==='transition' ? 'Then let’s go somewhere the rain has just stopped.' : 'The small light remained after everything else grew quiet.'; }
  }

  async function beginJourney(e:React.FormEvent) {
    e.preventDefault(); if (!wish.trim()) return; setBusy(true);
    const next=await ask('transition',wish.trim()); setLine(next); setStep('transition'); setBusy(false);
    window.setTimeout(()=>setStep('journey'),2600);
  }

  function point(e:PointerEvent) {
    const r=imageRef.current!.getBoundingClientRect(); return {x:Math.max(0,Math.min(r.width,e.clientX-r.left)),y:Math.max(0,Math.min(r.height,e.clientY-r.top))};
  }
  function down(e:PointerEvent<HTMLDivElement>) { e.currentTarget.setPointerCapture(e.pointerId); const p=point(e); start.current=p; setBox({...p,width:0,height:0}); }
  function move(e:PointerEvent<HTMLDivElement>) { if(!start.current)return; const p=point(e),s=start.current; setBox({x:Math.min(s.x,p.x),y:Math.min(s.y,p.y),width:Math.abs(p.x-s.x),height:Math.abs(p.y-s.y)}); }
  function up() { start.current=null; }

  async function makeMemory() {
    if(!box||box.width<35||box.height<35||!imageRef.current)return;
    setBusy(true); const img=imageRef.current,r=img.getBoundingClientRect(),scaleX=img.naturalWidth/r.width,scaleY=img.naturalHeight/r.height;
    const canvas=document.createElement('canvas'),w=720,h=Math.max(420,Math.round(720*box.height/box.width)); canvas.width=w;canvas.height=h;
    const ctx=canvas.getContext('2d')!; ctx.fillStyle='#e5dcc8';ctx.fillRect(0,0,w,h);
    ctx.filter='saturate(.62) contrast(1.06) sepia(.12)';ctx.drawImage(img,box.x*scaleX,box.y*scaleY,box.width*scaleX,box.height*scaleY,14,14,w-28,h-28);ctx.filter='none';
    const grain=ctx.createImageData(w,h); for(let i=0;i<grain.data.length;i+=4){const v=Math.random()*20;grain.data[i]=245;grain.data[i+1]=237;grain.data[i+2]=218;grain.data[i+3]=v;}ctx.putImageData(grain,0,0);
    const url=canvas.toDataURL('image/jpeg',.86); setSketch(url); setMemoryLine(await ask('memory',wish)); setStep('memory');setBusy(false);
  }
  function keep() { localStorage.setItem('somewhere:kept',JSON.stringify({image:sketch,line:memoryLine,ownership:'KEPT'}));setStep('kept'); }
  async function give() {
    setBusy(true); const response=await fetch('/api/memories',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({image:sketch,line:memoryLine})});
    if(!response.ok){setBusy(false);return;} const {id}=await response.json(); localStorage.removeItem('somewhere:kept');localStorage.setItem(`somewhere:given:${id}`,'GIVEN_AWAY');setShareId(id);setStep('given');setBusy(false);
  }
  const reset=()=>{setStep('landing');setWish('');setLine('');setSketch('');setBox(null);setShareId('');};

  if(step==='landing') return <section className="screen text-center"><p className="eyebrow mb-8">A small journey</p><h1 className="text-6xl md:text-8xl tracking-[-.04em]">Somewhere</h1><p className="mt-6 text-lg italic text-[#aaa69c]">You don&apos;t need a reason to go somewhere.</p><button className="quiet-button mt-14" onClick={()=>setStep('wish')}>Begin</button></section>;
  if(step==='wish') return <section className="screen w-full"><form onSubmit={beginJourney} className="w-full max-w-2xl text-center"><label htmlFor="wish" className="block text-3xl md:text-5xl leading-tight">Where would you like to be right now?</label><input id="wish" autoFocus maxLength={100} value={wish} onChange={e=>setWish(e.target.value)} placeholder="Somewhere quiet." className="mt-14 w-full border-b border-white/30 bg-transparent px-2 py-4 text-center text-xl outline-none placeholder:text-white/25"/><button disabled={busy||!wish.trim()} className="quiet-button mt-12">{busy?'Finding a way…':'Continue'}</button></form></section>;
  if(step==='transition') return <section className="screen text-center"><p className="max-w-2xl text-3xl md:text-5xl italic leading-snug">{line}</p></section>;
  if(step==='journey') return <section className="min-h-svh px-4 py-8 md:px-10 md:py-10"><header className="mb-6 flex items-end justify-between"><div><p className="eyebrow">Somewhere, for a moment</p><h2 className="mt-2 text-2xl md:text-3xl">Choose something you want to remember.</h2></div><span className="hidden text-sm italic text-white/45 md:block">Drag to make a frame</span></header><div className="relative mx-auto max-w-[1500px] touch-none cursor-crosshair overflow-hidden bg-[#27322f] shadow-2xl" onPointerDown={down} onPointerMove={move} onPointerUp={up}><img ref={imageRef} src={landscape} alt="A quiet lake after rainfall, with mountains, a cottage, and a distant boat" draggable={false} className="block w-full select-none"/>{box&&<div className="pointer-events-none absolute border border-[#fff8e7] bg-white/5 shadow-[0_0_0_9999px_rgba(10,14,12,.43)]" style={{left:box.x,top:box.y,width:box.width,height:box.height}}/>}</div><div className="mt-7 text-center"><button disabled={busy||!box||box.width<35||box.height<35} onClick={makeMemory} className="quiet-button">{busy?'Remembering…':'Remember this'}</button></div></section>;
  if(step==='memory'||step==='confirm') return <section className="screen"><div className="w-full max-w-3xl text-center"><p className="eyebrow">A memory from somewhere</p><div className="mx-auto mt-7 max-w-xl rotate-[-.4deg] bg-[#e7dfcc] p-3 pb-8 shadow-[0_25px_80px_rgba(0,0,0,.45)]"><img src={sketch} alt="Your selected memory, rendered as a faded travel sketch" className="w-full"/></div><p className="mx-auto mt-8 max-w-xl text-xl italic text-white/70">{memoryLine}</p>{step==='memory'?<><h2 className="mt-11 text-2xl">What would you like to do with this memory?</h2><div className="mt-7 flex flex-wrap justify-center gap-4"><button className="quiet-button" onClick={keep}>Keep it</button><button className="quiet-button" onClick={()=>setStep('confirm')}>Give it away</button></div></>:<div className="mt-10"><h2 className="text-2xl">If you give it away, it will no longer belong to you.</h2><p className="mt-3 text-sm text-white/45">The person with the link will be able to see it. You will not.</p><div className="mt-7 flex justify-center gap-4"><button className="quiet-button" onClick={()=>setStep('memory')}>Not yet</button><button disabled={busy} className="quiet-button" onClick={give}>{busy?'Letting go…':'I understand'}</button></div></div>}</div></section>;
  if(step==='kept') return <section className="screen text-center"><p className="eyebrow">The journey is over</p><h2 className="mt-8 text-4xl md:text-6xl">You kept this one.</h2><p className="mt-5 max-w-md italic text-white/50">It will wait quietly in this browser.</p><button className="quiet-button mt-12" onClick={reset}>Leave</button></section>;
  return <section className="screen text-center overflow-hidden"><div className="animate-[arrive_5s_ease_reverse_both] max-w-sm bg-[#e7dfcc] p-2 shadow-2xl"><img src={sketch} alt="" className="w-full"/></div><p className="eyebrow mt-8">This memory was given away</p><h2 className="mt-7 max-w-2xl whitespace-pre-line text-3xl md:text-5xl leading-snug">It isn&apos;t yours anymore.{`\n\n`}But perhaps that&apos;s why you&apos;ll remember it.</h2><div className="mt-10"><p className="text-sm text-white/45">Its new path</p><button onClick={()=>navigator.clipboard.writeText(`${location.origin}/memory/${shareId}`)} className="mt-2 border-b border-white/30 pb-1 text-sm">Copy the memory link</button></div></section>;
}
