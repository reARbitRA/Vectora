import { VectorArtwork } from '../../types';
import { runVectorization, VECTORIZATION_TECHNIQUES, VectorizationTechniqueId, UnifiedVectorizationOptions } from './index';

export interface VectorizationOptions extends Omit<UnifiedVectorizationOptions,'technique'> { technique: VectorizationTechniqueId; inputImage: ImageData; quality?: 'draft'|'standard'|'premium'; gpuEnabled?: boolean; onProgress?: (percent:number, stage:string)=>void; }
export interface VectorizationResult { svg:string; layers: VectorArtwork['layers']; metadata:{technique:VectorizationTechniqueId;pathCount:number;colorCount:number;processingMs:number;fidelityScore?:number}; artwork:VectorArtwork }
/** Stable async facade for UI, workers and future GPU/neural adapters. */
export class VectorizationEngine {
  readonly registry = new Map(VECTORIZATION_TECHNIQUES.map(t=>[t.id,t]));
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
export const techniqueCatalog=VECTORIZATION_TECHNIQUES;
