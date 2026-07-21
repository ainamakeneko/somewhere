import { readMemory } from '@/lib/memories';
import { notFound } from 'next/navigation';
export const dynamic='force-dynamic';
export default async function MemoryPage({params}:{params:{id:string}}) {
  const memory=await readMemory(params.id); if(!memory) notFound();
  return <main className="screen"><div className="w-full max-w-3xl text-center"><p className="eyebrow">A memory was given to you</p><div className="mx-auto mt-9 max-w-xl rotate-[.35deg] bg-[#e7dfcc] p-3 pb-8 shadow-[0_25px_80px_rgba(0,0,0,.45)]"><img src={memory.image} alt="A travel sketch someone chose to give away" className="w-full"/></div><p className="mx-auto mt-9 max-w-lg text-xl italic text-white/65">{memory.line}</p><p className="mt-10 text-xs tracking-widest text-white/30">It belongs here now.</p></div></main>;
}
