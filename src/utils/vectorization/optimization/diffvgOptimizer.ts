import { svgDocument, path } from '../helpers/svgBuilder';

export interface OptimizerOptions { pathCount?: number; iterations?: number; seed?: number; learningRate?: number; background?: string; onProgress?: (percent:number, stage:string)=>void }
export interface OptimizedPrimitive { x:number;y:number;width:number;height:number;color:string;opacity:number }
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
/**
 * A deterministic CPU fallback for DiffVG-style optimization. It optimizes soft
 * rectangular Bezier primitives against a raster target. The output format is
 * deliberately ordinary SVG so it can be edited and later handed to a real
 * DiffVG/WebGPU adapter without changing the API.
 */
export function optimizeRasterToSvg(image:ImageData, options:OptimizerOptions={}):{svg:string;primitives:OptimizedPrimitive[];loss:number} {
  const count=options.pathCount??24, iterations=options.iterations??80, rand=mulberry32(options.seed??17), {width,height}=image;
  const sample=(x:number,y:number)=>{const i=(clamp(Math.round(x),0,width-1)+clamp(Math.round(y),0,height-1)*width)*4;return [image.data[i],image.data[i+1],image.data[i+2]]};
  const ps:OptimizedPrimitive[] = Array.from({length:count},()=>{const x=rand()*width,y=rand()*height,w=width*(.05+rand()*.3),h=height*(.05+rand()*.3),c=sample(x,y);return{x,y,width:w,height:h,color:rgb(c),opacity:.35+rand()*.65}});
  const loss=()=>ps.reduce((sum,p)=>{const c=sample(p.x+p.width/2,p.y+p.height/2),q=hexRgb(p.color);return sum+(c[0]-q[0])**2+(c[1]-q[1])**2+(c[2]-q[2])**2},0)/ps.length;
  let best=loss();
  for(let step=0;step<iterations;step++){for(const p of ps){const old={...p};p.x+= (rand()-.5)*width*.08;p.y+=(rand()-.5)*height*.08;p.width=clamp(p.width*(.92+rand()*.16),2,width);p.height=clamp(p.height*(.92+rand()*.16),2,height);p.color=rgb(sample(p.x+p.width/2,p.y+p.height/2));const next=loss();if(next>best){Object.assign(p,old)}else best=next;}options.onProgress?.(Math.round((step+1)/iterations*100),'optimizing primitives');}
  const content=ps.map(p=>path(`M ${p.x.toFixed(2)} ${p.y.toFixed(2)} h ${p.width.toFixed(2)} v ${p.height.toFixed(2)} h ${(-p.width).toFixed(2)} Z`,{fill:p.color,opacity:p.opacity.toFixed(3)})).join('');
  return {svg:svgDocument(width,height,content,options.background??'#000','Optimized vector approximation'),primitives:ps,loss:best};
}
function rgb(c:number[]){return `#${c.map(v=>Math.round(v).toString(16).padStart(2,'0')).join('')}`}
function hexRgb(hex:string){return [parseInt(hex.slice(1,3),16),parseInt(hex.slice(3,5),16),parseInt(hex.slice(5,7),16)]}
function mulberry32(seed:number){return()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}}
