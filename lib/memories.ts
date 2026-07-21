import { promises as fs } from 'fs';
import path from 'path';

export type SharedMemory = { id:string; image:string; line:string; createdAt:string; ownership:'GIVEN_AWAY' };
const directory=path.join(process.cwd(),'.data','memories');
export async function saveMemory(memory:SharedMemory) { await fs.mkdir(directory,{recursive:true}); await fs.writeFile(path.join(directory,`${memory.id}.json`),JSON.stringify(memory),'utf8'); }
export async function readMemory(id:string):Promise<SharedMemory|null> { if(!/^[a-f0-9-]{36}$/.test(id)) return null; try { return JSON.parse(await fs.readFile(path.join(directory,`${id}.json`),'utf8')); } catch { return null; } }
