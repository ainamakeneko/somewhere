import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const fallbacks={transition:'Then let’s go somewhere the rain has just stopped.',memory:'The small light remained after everything else grew quiet.'};
export async function POST(request:Request) {
  const body=await request.json().catch(()=>({}));
  const kind=body.kind==='memory'?'memory':'transition';
  const text=typeof body.text==='string'?body.text.slice(0,100):'';
  if(!process.env.OPENAI_API_KEY) return NextResponse.json({line:fallbacks[kind],source:'fallback'});
  try {
    const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});
    const instructions=kind==='transition'
      ? 'Write exactly one short atmospheric transition sentence beginning naturally with “Then”. Respond to where the visitor wants to be. No advice, analysis, explanation, therapy language, quotation marks, or more than 18 words.'
      : 'Write exactly one short, restrained observation for a travel sketch chosen during a quiet journey. No advice, analysis, sentimentality, therapy language, quotation marks, or more than 16 words.';
    const response=await client.responses.create({model:process.env.OPENAI_MODEL||'gpt-5.6',instructions,input:text||'Somewhere quiet.',max_output_tokens:60});
    const line=response.output_text.trim();
    return NextResponse.json({line:line||fallbacks[kind],source:'openai'});
  } catch { return NextResponse.json({line:fallbacks[kind],source:'fallback'}); }
}
