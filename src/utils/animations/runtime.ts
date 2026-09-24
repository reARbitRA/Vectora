import { AnimationConfig, AnimationPresetId } from '../../types';
import { injectExtendedAnimation } from './index';
import { animateSvg } from './helpers/waapiHelpers';
export interface AnimationOptions { preset:AnimationPresetId; target:SVGElement|string; duration?:number; delay?:number; easing?:string; reducedMotion?:'static'|'minimal'|'skip'; onComplete?:()=>void }
/** Browser runtime adapter: keeps animation application out of React components. */
export class AnimationEngine {
  apply(svg:SVGSVGElement, options:AnimationOptions):Animation { const target=typeof options.target==='string'?svg.querySelector(options.target):options.target;if(!target)throw new Error(`Animation target not found: ${String(options.target)}`);const reduced=typeof window!=='undefined'&&window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;if(reduced&&options.reducedMotion==='skip')return new Animation();const animation=animateSvg(target,[{opacity:0},{opacity:1}],{duration:options.duration??400,easing:options.easing??'ease-in-out',delay:options.delay??0,fill:'forwards',reducedMotion:options.reducedMotion==='skip'?'static':(options.reducedMotion??'minimal')});if(options.onComplete)animation.finished.then(options.onComplete).catch(()=>{});return animation; }
  static bake(svg:string,preset:AnimationPresetId,duration=3):string { const config={preset,enabled:true,duration,speed:1,easing:'ease-in-out',direction:'normal',loopMode:'once',iterationCount:1,motionTrail:false,motionTrailCount:0,motionTrailOpacity:0,autoBake:false,isPaused:false,layerOverrides:{}} as AnimationConfig; return injectExtendedAnimation(svg,config); }
}
