import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { saveMemory } from '@/lib/memories';
export const runtime='nodejs';
export async function POST(request:Request) {
  const body=await request.json().catch(()=>({}));
  if(typeof body.image!=='string'||!body.image.startsWith('data:image/jpeg;base64,')||body.image.length>4_500_000||typeof body.line!=='string') return NextResponse.json({error:'Invalid memory'},{status:400});
  const id=randomUUID(); await saveMemory({id,image:body.image,line:body.line.slice(0,240),createdAt:new Date().toISOString(),ownership:'GIVEN_AWAY'});
  return NextResponse.json({id},{status:201});
}
