import { VectorArtwork } from '../../types';
import type { UnifiedVectorizationOptions, VectorizationTechniqueId, VectorizationMeta } from './index';
import { runVectorization, VECTORIZATION_TECHNIQUES } from './index';

export interface VectorizationOptions extends Omit<UnifiedVectorizationOptions,'technique'> { technique: VectorizationTechniqueId; inputImage: ImageData; quality?: 'draft'|'standard'|'premium'; gpuEnabled?: boolean; onProgress?: (percent:number, stage:string)=>void; }
export interface VectorizationResult { svg:string; layers: VectorArtwork['layers']; metadata:{technique:VectorizationTechniqueId;pathCount:number;colorCount:number;processingMs:number;fidelityScore?:number}; artwork:VectorArtwork }
/** Stable async facade for UI, workers and future GPU/neural adapters. */
export class VectorizationEngine {
  private _registry?: Map<VectorizationTechniqueId, VectorizationMeta>;

  get registry(): Map<VectorizationTechniqueId, VectorizationMeta> {
    if (!this._registry) {
      const techniques = typeof VECTORIZATION_TECHNIQUES !== 'undefined' ? VECTORIZATION_TECHNIQUES : [];
      this._registry = new Map(techniques.map(t => [t.id, t]));
    }
    return this._registry;
  }

  async vectorize(options:VectorizationOptions):Promise<VectorizationResult>{
    const started=performance.now(); const report=options.onProgress||(()=>{}); report(0,'preprocessing');
    if(!options.inputImage) throw new Error('inputImage is required');
    report(20,'tracing');
    const {artwork}=runVectorization(options.inputImage,options,'vectora-input');
    report(85,'building SVG');
    const pathCount=(artwork.svg.match(/<(?:path|polyline|polygon)\b/g)||[]).length;
    const colorCount=new Set((artwork.svg.match(/#[0-9a-f]{6}/gi)||[])).size;
    report(100,'complete');
    return {svg:artwork.svg,layers:artwork.layers,artwork,metadata:{technique:options.technique,pathCount,colorCount,processingMs:performance.now()-started}};
  }
}

/**
 * Lazy proxy to avoid circular dependency / TDZ issues during module loading.
 */
export const techniqueCatalog: VectorizationMeta[] = new Proxy([] as VectorizationMeta[], {
  get(_target, prop) {
    const list = typeof VECTORIZATION_TECHNIQUES !== 'undefined' ? VECTORIZATION_TECHNIQUES : [];
    const val = (list as any)[prop];
    if (typeof val === 'function') {
      return val.bind(list);
    }
    return val;
  },
});

