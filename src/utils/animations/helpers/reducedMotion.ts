export type ReducedMotionMode='static'|'minimal'|'full';
export function prefersReducedMotion():boolean{return typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches===true;}
export function reducedMotionCss(selector='*'):string{return `@media (prefers-reduced-motion: reduce){${selector}{animation-duration:.01ms!important;animation-iteration-count:1!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}`;}
