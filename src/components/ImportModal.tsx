import React, { useState, useRef } from 'react';
import { VectorArtwork, ImportSourceType, ImportRequest } from '../types';
import {
  VECTORIZATION_TECHNIQUES,
  VectorizationTechniqueId,
  runVectorization,
} from '../utils/vectorization';
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Sparkles,
  X,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Layers,
  Palette,
  FileCode,
  Scan,
  RefreshCw,
  Zap,
  Sliders,
  Eye,
  PenTool,
  Activity,
  Radio,
  Waves,
  Flame,
} from 'lucide-react';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onArtworkImported: (artwork: VectorArtwork) => void;
}

const SAMPLE_TEXT_DOCS = [
  {
    name: 'Quantum_Compute_Telemetry.txt',
    desc: 'Technical HUD schematic with polar coordinate grids and cryogenic sensor rings',
    content: `SYSTEM SPECIFICATION: QUANTUM CRYOGENIC TELEMETRY CORE
Version: 4.8.2
Aesthetic: Precision Technical HUD & Cyberpunk Architecture

STRUCTURAL LAYERS REQUIRED:
1. Base Matrix: Deep obsidian background with hexagonal polar coordinates and logarithmic spiral ticks.
2. Quantum Core: 3 concentric interlocking rings containing qubit flux states and glowing cyan phase nodes.
3. Telemetry Bus: Monospace vector labels displaying "FREQUENCY: 4.82 GHz", "COHERENCE: 99.98%", "CRYOGENIC TEMP: 12 mK".
4. Harmonic Crosshairs: Laser-aligned reticles with precision degree markings at 0°, 45°, 90°, 180°, 270°.
5. Gradient Highlights: High-voltage neon green and electric cyan specular beams.`,
  },
  {
    name: 'Bauhaus_Modernist_Poster.md',
    desc: 'Constructivist art composition with geometric intersecting planes and primary palette',
    content: `# Bauhaus Weimar Vector Composition Spec
# Design Movement: 1923 Geometric Modernism
# Visual Rationale: Harmony through dynamic tension and mathematical proportion.

- Form: Large bold circular arc in cadmium red intersecting an asymmetric deep navy rectangular frame.
- Diagonal Dynamics: 45-degree ray array intersecting golden ratio points.
- Monospace Typography: "STAATLICHES BAUHAUS WEIMAR" along the vertical grid line.
- Color Balance: Pure geometric contrast (#E63946 Red, #1D3557 Navy, #F1FAEE Cream, #FFB703 Ochre).
- Clean vector bezier lines without raster degradation.`,
  },
  {
    name: 'Cyber_City_Transit_Map.json',
    desc: 'Metro diagram with glowing transit lines, station nodes, and neon grid',
    content: `{
  "project": "NEO-TOKYO SUBTERRANEAN TRANSIT VECTOR MAP",
  "style": "Cyberpunk Precision Cartography",
  "elements": {
    "lines": ["Hyperloop Alpha (Cyan)", "Orbital Express (Magenta)", "Maglev Shinjuku (Gold)"],
    "interchanges": 12,
    "landmarks": ["Sector 7 Fusion Hub", "Sky-Arc Terminal", "Kuroshio Deep Port"],
    "aesthetic": "Dark canvas with glowing neon paths, station rings, coordinate tickers, and scanline FX"
  }
}`,
  },
];

export const ImportModal: React.FC<ImportModalProps> = ({
  isOpen,
  onClose,
  onArtworkImported,
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'paste' | 'samples'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<ImportSourceType>('image');
  const [filePreviewUri, setFilePreviewUri] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState('');
  const [targetStyle, setTargetStyle] = useState('Modernist Geometric');
  const [complexity, setComplexity] = useState<'minimal' | 'balanced' | 'intricate' | 'ultra'>('balanced');
  const [paletteMood, setPaletteMood] = useState('Harmonious Precision');
  const [customDirectives, setCustomDirectives] = useState('');
  const [vectorEngineMode, setVectorEngineMode] = useState<'algorithmic' | 'ai'>('algorithmic');
  const [selectedTechnique, setSelectedTechnique] = useState<VectorizationTechniqueId>('centerline');
  const [detailLevel, setDetailLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [invertLuminance, setInvertLuminance] = useState(false);
  const [vectorColor, setVectorColor] = useState('#00FF00');
  const [vectorBgColor, setVectorBgColor] = useState('#0A0A0A');
  const [techniqueCategoryFilter, setTechniqueCategoryFilter] = useState<string>('all');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (file: File) => {
    setError(null);
    setSelectedFile(file);

    const isImg = file.type.startsWith('image/') || /\.(png|jpe?g|webp|gif|bmp|svg)$/i.test(file.name);
    const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);

    if (isSvg) {
      setFileType('svg');
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setFilePreviewUri(text);
      };
      reader.readAsText(file);
    } else if (isImg) {
      setFileType('image');
      const reader = new FileReader();
      reader.onload = (e) => {
        setFilePreviewUri(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      // Text document
      setFileType('text');
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setPastedText(text);
        setFilePreviewUri(null);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const extractImageDataFromDataUri = (dataUri: string): Promise<ImageData> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const maxDim = 800;
        let w = img.width;
        let h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) {
            h = Math.round((h * maxDim) / w);
            w = maxDim;
          } else {
            w = Math.round((w * maxDim) / h);
            h = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(10, w);
        canvas.height = Math.max(10, h);
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }
        ctx.drawImage(img, 0, 0, w, h);
        resolve(ctx.getImageData(0, 0, w, h));
      };
      img.onerror = () => reject(new Error('Failed to load image for vectorization'));
      img.src = dataUri;
    });
  };

  const handleExecuteImport = async () => {
    setError(null);
    setIsProcessing(true);

    try {
      // 1. Instant Algorithmic Client-Side Engine for Images
      if (fileType === 'image' && vectorEngineMode === 'algorithmic' && filePreviewUri) {
        setStatusMessage(`Processing algorithmic vector trace: ${selectedTechnique}...`);
        const imgData = await extractImageDataFromDataUri(filePreviewUri);
        const result = runVectorization(
          imgData,
          {
            technique: selectedTechnique,
            detailLevel,
            invert: invertLuminance,
            strokeColor: vectorColor,
            fillColor: vectorColor,
            backgroundColor: vectorBgColor,
          },
          selectedFile?.name || 'imported-vector'
        );

        setStatusMessage('Mathematical vectorization complete!');
        setTimeout(() => {
          setIsProcessing(false);
          onArtworkImported(result.artwork);
          onClose();
        }, 200);
        return;
      }

      setStatusMessage(
        fileType === 'image'
          ? 'Scanning image composition & deconstructing geometry...'
          : fileType === 'svg'
          ? 'Standardizing SVG layers & parsing AST...'
          : 'Analyzing document concepts & structuring vector hierarchy...'
      );

      const payload: ImportRequest = {
        type: fileType,
        fileName: selectedFile?.name || (fileType === 'image' ? 'imported-image.png' : 'document.txt'),
        fileSize: selectedFile?.size || (pastedText.length * 2),
        dataUri: fileType === 'image' ? filePreviewUri || undefined : undefined,
        textContent: fileType === 'text' ? pastedText : undefined,
        rawSvg: fileType === 'svg' ? filePreviewUri || undefined : undefined,
        targetStyle,
        complexity,
        paletteMood,
        promptCustomization: customDirectives,
      };

      const res = await fetch('/api/import-vectorize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        let errorMessage = `Server error: ${res.status} ${res.statusText}`;
        if (contentType && contentType.includes('application/json')) {
          const errorData = await res.json();
          errorMessage = errorData.error || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const json = await res.json();

      if (!json.success) {
        throw new Error(json.error || 'Vectorization failed');
      }

      setStatusMessage('Pristine vector SVG generated successfully!');

      const data = json.data;
      const newArtwork: VectorArtwork = {
        id: `imported-${Date.now()}`,
        title: data.title || (selectedFile?.name ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Imported Vector Masterpiece'),
        concept: data.concept || 'Authentic vector design generated from imported source.',
        style: data.style || targetStyle,
        viewBox: '0 0 1000 1000',
        palette: data.palette || [
          { name: 'Background', hex: '#0A0A0A', role: 'background' },
          { name: 'Primary Accent', hex: '#00FF00', role: 'primary' },
          { name: 'Secondary Ink', hex: '#FFFFFF', role: 'secondary' },
          { name: 'Accent Beam', hex: '#00FFFF', role: 'accent' },
        ],
        layers: data.layers || [
          { name: '01_Background', description: 'Backdrop grid' },
          { name: '02_Shapes_Primary', description: 'Primary geometry' },
          { name: '03_Artwork_Core', description: 'Main focal vector paths' },
          { name: '04_Details_Secondary', description: 'Precision details' },
          { name: '05_Text_Headlines', description: 'Typography' },
          { name: '06_Accents_Highlights', description: 'Highlights' },
          { name: '07_FX_Overlays', description: 'Effects overlay' },
        ],
        svg: data.svg,
        evolutionIdeas: data.evolutionIdeas || [
          'Add animated path strokes',
          'Experiment with complementary blend modes',
        ],
        createdAt: new Date().toISOString(),
        tags: ['Imported', fileType, targetStyle],
      };

      onArtworkImported(newArtwork);
      onClose();
    } catch (err: any) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to scan and vectorize');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLoadSample = (sample: typeof SAMPLE_TEXT_DOCS[0]) => {
    setSelectedFile(new File([sample.content], sample.name, { type: 'text/plain' }));
    setFileType('text');
    setPastedText(sample.content);
    setFilePreviewUri(null);
    setActiveTab('paste');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#000000]/85 backdrop-blur-md flex items-center justify-center p-4 font-mono select-none">
      <div className="bg-[#0D0D0D] border border-[#333333] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#333333] flex items-center justify-between bg-[#141414]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[#00FF00] text-[#000000] flex items-center justify-center font-bold">
              <Scan className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#FFFFFF] uppercase tracking-wider">
                Import & Vectorize Engine
              </h2>
              <p className="text-[11px] text-[#888888]">
                Convert raster images or text design documents into sophisticated vector SVGs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888888] hover:text-[#FFFFFF] hover:bg-[#222222]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-[#333333] bg-[#0A0A0A] px-4 pt-2 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'upload'
                ? 'border-[#00FF00] text-[#00FF00] bg-[#141414]'
                : 'border-transparent text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Image or Doc</span>
          </button>

          <button
            onClick={() => setActiveTab('paste')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'paste'
                ? 'border-[#00FF00] text-[#00FF00] bg-[#141414]'
                : 'border-transparent text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Paste Text / Specs</span>
          </button>

          <button
            onClick={() => setActiveTab('samples')}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-bold uppercase tracking-wider transition-all ${
              activeTab === 'samples'
                ? 'border-[#00FF00] text-[#00FF00] bg-[#141414]'
                : 'border-transparent text-[#888888] hover:text-[#FFFFFF]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sample Blueprints</span>
          </button>
        </div>

        {/* Main Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {activeTab === 'upload' && (
            <div className="space-y-3">
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-3 ${
                  isDragging
                    ? 'border-[#00FF00] bg-[#00FF00]/10'
                    : selectedFile
                    ? 'border-[#00FF00]/60 bg-[#121212]'
                    : 'border-[#333333] hover:border-[#555555] bg-[#0F0F0F]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,.svg,.txt,.md,.markdown,.json,.csv,.spec"
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      handleFileSelect(e.target.files[0]);
                    }
                  }}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center gap-2">
                    {fileType === 'image' && filePreviewUri ? (
                      <div className="relative group w-32 h-32 border border-[#444444] bg-[#000000] p-1 flex items-center justify-center overflow-hidden">
                        <img
                          src={filePreviewUri}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-[#00FF00]/15 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Scan className="w-6 h-6 text-[#00FF00] animate-pulse" />
                        </div>
                      </div>
                    ) : (
                      <div className="w-16 h-16 bg-[#1A1A1A] border border-[#00FF00] flex items-center justify-center text-[#00FF00]">
                        {fileType === 'svg' ? (
                          <FileCode className="w-8 h-8" />
                        ) : (
                          <FileText className="w-8 h-8" />
                        )}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-xs font-bold text-[#FFFFFF]">{selectedFile.name}</p>
                      <p className="text-[10px] text-[#888888]">
                        {(selectedFile.size / 1024).toFixed(1)} KB · {fileType.toUpperCase()} file ready
                      </p>
                    </div>
                    <span className="text-[10px] text-[#00FF00] underline">Click or drop to replace file</span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 bg-[#1A1A1A] border border-[#333333] flex items-center justify-center text-[#888888]">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[#FFFFFF]">
                        Drag and drop image or text document here
                      </p>
                      <p className="text-[10px] text-[#777777] mt-1">
                        PNG, JPG, WEBP, SVG, TXT, MD, JSON, CSV
                      </p>
                    </div>
                    <button
                      type="button"
                      className="px-3 py-1 bg-[#1A1A1A] border border-[#333333] hover:border-[#00FF00] text-[#00FF00] text-xs font-bold uppercase"
                    >
                      Browse Files
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'paste' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#FFFFFF] uppercase tracking-wider flex items-center justify-between">
                <span>Design Specifications / Document Text</span>
                <span className="text-[10px] text-[#888888]">{pastedText.length} characters</span>
              </label>
              <textarea
                value={pastedText}
                onChange={(e) => {
                  setPastedText(e.target.value);
                  setFileType('text');
                }}
                placeholder="Paste design specifications, layout instructions, technical descriptions, poem, or data requirements here..."
                rows={8}
                className="w-full bg-[#121212] border border-[#333333] focus:border-[#00FF00] p-3 text-xs text-[#FFFFFF] font-mono outline-none resize-none custom-scrollbar"
              />
            </div>
          )}

          {activeTab === 'samples' && (
            <div className="space-y-2">
              <p className="text-xs text-[#888888]">
                Select a pre-configured sample document to test instant vectorization:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
                {SAMPLE_TEXT_DOCS.map((sample, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleLoadSample(sample)}
                    className="p-3 bg-[#141414] border border-[#333333] hover:border-[#00FF00] cursor-pointer transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-[#00FF00] text-xs font-bold mb-1">
                        <FileCode className="w-3.5 h-3.5" />
                        <span className="truncate">{sample.name}</span>
                      </div>
                      <p className="text-[10px] text-[#888888] line-clamp-2">
                        {sample.desc}
                      </p>
                    </div>
                    <button className="mt-3 w-full py-1 bg-[#1E1E1E] hover:bg-[#00FF00] hover:text-[#000000] text-[#00FF00] text-[10px] font-bold uppercase transition-colors">
                      Load Blueprint
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vector Configuration Controls */}
          <div className="p-3.5 bg-[#121212] border border-[#333333] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#FFFFFF] uppercase tracking-wider">
                <Sliders className="w-3.5 h-3.5 text-[#00FF00]" />
                <span>Vectorization Engine Pipeline</span>
              </div>

              {fileType === 'image' && (
                <div className="flex items-center gap-1 bg-[#0A0A0A] p-0.5 border border-[#333333]">
                  <button
                    type="button"
                    onClick={() => setVectorEngineMode('algorithmic')}
                    className={`px-2 py-1 text-[10px] uppercase font-bold flex items-center gap-1 transition-colors ${
                      vectorEngineMode === 'algorithmic'
                        ? 'bg-[#00FF00] text-[#000000]'
                        : 'text-[#888888] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <Zap className="w-3 h-3" />
                    <span>Algorithmic Math (Instant)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVectorEngineMode('ai')}
                    className={`px-2 py-1 text-[10px] uppercase font-bold flex items-center gap-1 transition-colors ${
                      vectorEngineMode === 'ai'
                        ? 'bg-[#00FFFF] text-[#000000]'
                        : 'text-[#888888] hover:text-[#FFFFFF]'
                    }`}
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>AI Architectural</span>
                  </button>
                </div>
              )}
            </div>

            {/* If Image and Algorithmic Engine Mode: Render 12 Vectorization Techniques */}
            {fileType === 'image' && vectorEngineMode === 'algorithmic' ? (
              <div className="space-y-3 pt-1">
                {/* Technique Category Filter Pills */}
                <div className="flex flex-wrap gap-1">
                  {[
                    { id: 'all', label: 'All 12 Engines' },
                    { id: 'Contour & Line Art', label: 'Contour & Line' },
                    { id: 'Color & Low-Poly', label: 'Color & Mesh' },
                    { id: 'Pattern & Engraving', label: 'Engraving & Dither' },
                    { id: 'Experimental & 3D', label: '3D & Matrix' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setTechniqueCategoryFilter(cat.id)}
                      className={`px-2 py-0.5 text-[10px] uppercase font-mono border transition-colors ${
                        techniqueCategoryFilter === cat.id
                          ? 'bg-[#00FF00]/15 text-[#00FF00] border-[#00FF00]'
                          : 'bg-[#181818] text-[#777777] border-[#2A2A2A] hover:text-[#FFFFFF]'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* Grid of Algorithms */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[220px] overflow-y-auto custom-scrollbar p-0.5">
                  {VECTORIZATION_TECHNIQUES.filter(
                    (t) => techniqueCategoryFilter === 'all' || t.category === techniqueCategoryFilter
                  ).map((tech) => {
                    const isSelected = selectedTechnique === tech.id;
                    return (
                      <div
                        key={tech.id}
                        onClick={() => setSelectedTechnique(tech.id)}
                        className={`p-2.5 border text-left cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#00FF00]/10 border-[#00FF00] shadow-[0_0_10px_rgba(0,255,0,0.15)]'
                            : 'bg-[#161616] border-[#282828] hover:border-[#444444] hover:bg-[#1A1A1A]'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className={`w-6 h-6 rounded-sm flex items-center justify-center shrink-0 ${
                              isSelected ? 'bg-[#00FF00] text-[#000000]' : 'bg-[#222222] text-[#888888]'
                            }`}
                          >
                            {tech.id === 'centerline' ? <PenTool className="w-3.5 h-3.5" /> :
                             tech.id === 'region' ? <Layers className="w-3.5 h-3.5" /> :
                             tech.id === 'color-quantize' ? <Sparkles className="w-3.5 h-3.5" /> :
                             tech.id === 'delaunay' ? <Zap className="w-3.5 h-3.5" /> :
                             tech.id === 'halftone' ? <Radio className="w-3.5 h-3.5" /> :
                             tech.id === 'voronoi-stipple' ? <Eye className="w-3.5 h-3.5" /> :
                             tech.id === 'contour' ? <Waves className="w-3.5 h-3.5" /> :
                             tech.id === 'cross-hatch' ? <Flame className="w-3.5 h-3.5" /> :
                             tech.id === 'tsp-single-line' ? <Activity className="w-3.5 h-3.5" /> :
                             tech.id === 'canny-blueprint' ? <Cpu className="w-3.5 h-3.5" /> :
                             tech.id === 'isometric-voxel' ? <Sliders className="w-3.5 h-3.5" /> :
                             <FileCode className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className={`text-[11px] font-bold uppercase truncate ${isSelected ? 'text-[#00FF00]' : 'text-[#FFFFFF]'}`}>
                              {tech.name}
                            </h4>
                            <p className="text-[9px] text-[#777777] truncate">{tech.tagline}</p>
                          </div>
                        </div>
                        <p className="text-[10px] text-[#888888] line-clamp-2 leading-tight">
                          {tech.description}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {/* Algorithmic Fine-Tuning Controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-[#222222] text-xs">
                  <div>
                    <label className="block text-[10px] text-[#888888] uppercase mb-1">Detail Resolution</label>
                    <select
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(e.target.value as any)}
                      className="w-full bg-[#1A1A1A] border border-[#333333] text-[#FFFFFF] px-2 py-1 outline-none text-xs"
                    >
                      <option value="low">Low (Simplified)</option>
                      <option value="medium">Medium (Standard)</option>
                      <option value="high">High (Maximum Fidelity)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888888] uppercase mb-1">Vector Color</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={vectorColor}
                        onChange={(e) => setVectorColor(e.target.value)}
                        className="w-6 h-6 border border-[#333333] bg-transparent cursor-pointer p-0"
                      />
                      <span className="text-[11px] text-[#AAAAAA] uppercase font-mono">{vectorColor}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] text-[#888888] uppercase mb-1">Canvas Background</label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="color"
                        value={vectorBgColor}
                        onChange={(e) => setVectorBgColor(e.target.value)}
                        className="w-6 h-6 border border-[#333333] bg-transparent cursor-pointer p-0"
                      />
                      <span className="text-[11px] text-[#AAAAAA] uppercase font-mono">{vectorBgColor}</span>
                    </div>
                  </div>

                  <div className="flex items-end pb-1">
                    <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#CCCCCC]">
                      <input
                        type="checkbox"
                        checked={invertLuminance}
                        onChange={(e) => setInvertLuminance(e.target.checked)}
                        className="accent-[#00FF00]"
                      />
                      <span>Invert Contrast</span>
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              /* AI Architectural Vectorizer Controls */
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                {/* Target Style */}
                <div>
                  <label className="block text-[10px] text-[#888888] uppercase mb-1">
                    Target Aesthetic Style
                  </label>
                  <select
                    value={targetStyle}
                    onChange={(e) => setTargetStyle(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] text-[#FFFFFF] px-2 py-1 outline-none text-xs"
                  >
                    <option value="Modernist Geometric">Modernist Geometric</option>
                    <option value="Technical HUD / Sci-Fi">Technical HUD / Sci-Fi</option>
                    <option value="Cyberpunk Precision">Cyberpunk Precision</option>
                    <option value="Bauhaus & Swiss Style">Bauhaus & Swiss Style</option>
                    <option value="Art Deco Luxury">Art Deco Luxury</option>
                    <option value="Japanese Editorial">Japanese Editorial</option>
                    <option value="Parametric Generative">Parametric Generative</option>
                    <option value="Clean Minimalist Iconography">Clean Minimalist Iconography</option>
                  </select>
                </div>

                {/* Complexity */}
                <div>
                  <label className="block text-[10px] text-[#888888] uppercase mb-1">
                    Complexity Level
                  </label>
                  <select
                    value={complexity}
                    onChange={(e) => setComplexity(e.target.value as any)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] text-[#FFFFFF] px-2 py-1 outline-none text-xs"
                  >
                    <option value="minimal">Minimal (Clean Silhouettes)</option>
                    <option value="balanced">Balanced (Standard Masterpiece)</option>
                    <option value="intricate">Intricate (Rich Sub-paths & Gradients)</option>
                    <option value="ultra">Ultra Precision (Fine Telemetry)</option>
                  </select>
                </div>

                {/* Palette Mood */}
                <div>
                  <label className="block text-[10px] text-[#888888] uppercase mb-1">
                    Palette Vibe
                  </label>
                  <select
                    value={paletteMood}
                    onChange={(e) => setPaletteMood(e.target.value)}
                    className="w-full bg-[#1A1A1A] border border-[#333333] text-[#FFFFFF] px-2 py-1 outline-none text-xs"
                  >
                    <option value="Harmonious Precision">Harmonious Precision</option>
                    <option value="Electric Cyberpunk (Cyan/Neon/Magenta)">Electric Cyberpunk</option>
                    <option value="Monochrome High-Contrast (Obsidian/White)">Monochrome High-Contrast</option>
                    <option value="Bauhaus Primary (Red/Navy/Gold)">Bauhaus Primary</option>
                    <option value="Earthen Editorial (Olive/Terracotta)">Earthen Editorial</option>
                    <option value="Dark Obsidian HUD">Dark Obsidian HUD</option>
                  </select>
                </div>
              </div>
            )}

            {/* Custom Notes */}
            <div>
              <label className="block text-[10px] text-[#888888] uppercase mb-1">
                Custom Directives / Details (Optional)
              </label>
              <input
                type="text"
                value={customDirectives}
                onChange={(e) => setCustomDirectives(e.target.value)}
                placeholder="e.g. Include circular radar crosshairs, 45-degree angle slices, and glowing nodes..."
                className="w-full bg-[#1A1A1A] border border-[#333333] focus:border-[#00FF00] px-2.5 py-1 text-xs text-[#FFFFFF] outline-none"
              />
            </div>
          </div>

          {/* Status / Error Message */}
          {error && (
            <div className="p-3 bg-[#FF0000]/10 border border-[#FF0000]/50 text-[#FF5555] text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isProcessing && (
            <div className="p-3 bg-[#00FF00]/10 border border-[#00FF00]/40 text-[#00FF00] text-xs flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00FF00]" />
              <span>{statusMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-[#333333] bg-[#141414] flex items-center justify-between">
          <div className="text-[11px] text-[#777777]">
            {fileType === 'image'
              ? 'Multi-layer vector scan with semantic grouping'
              : 'Concept extraction & SVG structure synthesis'}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#2A2A2A] text-[#888888] hover:text-[#FFFFFF] text-xs uppercase font-bold border border-[#333333]"
            >
              Cancel
            </button>

            <button
              onClick={handleExecuteImport}
              disabled={isProcessing || (!selectedFile && !pastedText.trim())}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#00FF00] hover:bg-[#33FF33] disabled:opacity-30 disabled:hover:bg-[#00FF00] text-[#000000] text-xs uppercase font-black tracking-wider transition-all"
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Scanning & Vectorizing...</span>
                </>
              ) : (
                <>
                  <Zap className="w-3.5 h-3.5 fill-[#000000]" />
                  <span>Scan & Vectorize</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
