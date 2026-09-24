export function evenOddPath(subpaths:string[]):string{return subpaths.join(' ')}
export function signedArea(points:{x:number;y:number}[]):number{return points.reduce((s,p,i)=>{const q=points[(i+1)%points.length];return s+p.x*q.y-q.x*p.y},0)/2}
