import { svgDocument, path } from './helpers/svgBuilder';
export interface MarchingSquaresOptions { levels?: number; strokeColor?: string; strokeWidth?: number; backgroundColor?: string }
/** Multi-level isoline extraction with linear edge interpolation. */
export function traceMarchingSquares(image: ImageData, options: MarchingSquaresOptions = {}) {
  const {width,height,data}=image, levels=options.levels??8, lines:string[]=[];
  const value=(x:number,y:number)=>{const i=(Math.max(0,Math.min(width-1,x))+Math.max(0,Math.min(height-1,y))*width)*4;return (data[i]*.2126+data[i+1]*.7152+data[i+2]*.0722)/255};
  for(let l=1;l<=levels;l++){const t=l/(levels+1);for(let y=0;y<height-1;y++)for(let x=0;x<width-1;x++){const a=value(x,y),b=value(x+1,y),c=value(x+1,y+1),d=value(x,y+1), pts:{x:number;y:number}[]=[];const edge=(v1:number,v2:number,p1:{x:number;y:number},p2:{x:number;y:number})=>{if((v1<t)!==(v2<t)){const q=(t-v1)/(v2-v1||1);pts.push({x:p1.x+(p2.x-p1.x)*q,y:p1.y+(p2.y-p1.y)*q})}};edge(a,b,{x,y},{x:x+1,y});edge(b,c,{x:x+1,y},{x:x+1,y:y+1});edge(c,d,{x:x+1,y:y+1},{x,y:y+1});edge(d,a,{x,y:y+1},{x,y});if(pts.length>=2)lines.push(path(`M ${pts[0].x.toFixed(2)} ${pts[0].y.toFixed(2)} L ${pts[1].x.toFixed(2)} ${pts[1].y.toFixed(2)}`,{fill:'none',stroke:options.strokeColor??'#00ffff','stroke-width':String(options.strokeWidth??1),opacity:String(.35+l/(levels*1.5))}))}}
  return {svg:svgDocument(width,height,lines.join(''),options.backgroundColor??'transparent','Marching squares isolines'),pathCount:lines.length};
}
