import { NextResponse } from 'next/server';
import { readMemory } from '@/lib/memories';
export const runtime='nodejs';
export async function GET(_:Request,{params}:{params:{id:string}}) { const memory=await readMemory(params.id); return memory?NextResponse.json(memory):NextResponse.json({error:'Not found'},{status:404}); }
