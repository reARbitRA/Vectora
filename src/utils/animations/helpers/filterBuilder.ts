export function filter(id:string,content:string,region='-20% -20% 140% 140%'){return `<filter id="${id}" x="${region.split(' ')[0]}" y="${region.split(' ')[1]}" width="${region.split(' ')[2]}" height="${region.split(' ')[3]}">${content}</filter>`;}
export const gaussian=(std:string,result='blur')=>`<feGaussianBlur stdDeviation="${std}" result="${result}"/>`;
export const turbulence=(frequency='0.02',result='noise')=>`<feTurbulence baseFrequency="${frequency}" numOctaves="2" result="${result}"/>`;
