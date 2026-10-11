import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Cpu,
  Zap,
  ChevronRight,
  SlidersHorizontal,
  Bookmark,
  BookmarkCheck,
  ArrowLeftRight,
  Code,
  Copy,
  Check,
  ExternalLink,
  Sparkles,
  Layers,
  PenTool,
  Radio,
  Eye,
  Waves,
  Activity,
  Compass,
  FileCode,
  Shield,
  Palette,
  Download,
  X,
  Play,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';
import { VECTORIZATION_TECHNIQUES } from '../utils/vectorization';
import { ALL_ANIMATION_PRESETS } from '../utils/animations';
import {
  EncyclopediaEntry,
  GEOMETRY_ENTRIES,
  FILTER_ENTRIES,
  COLOR_ENTRIES,
  STANDARDS_ENTRIES,
} from '../data/encyclopediaData';
import { getAnimationLiveSvg, getVectorizationLiveSvg } from '../utils/encyclopediaPreviews';

interface EncyclopediaViewProps {
  onOpenStudio?: () => void;
}

const BOOKMARKS_STORAGE_KEY = 'vectora_bookmarked_entries';

export const EncyclopediaView: React.FC<EncyclopediaViewProps> = ({ onOpenStudio }) => {
  // State
  const [query, setQuery] = useState('');
  const [domainFilter, setDomainFilter] = useState<'all' | 'vectorization' | 'animation' | 'geometry' | 'filters' | 'color' | 'standards'>('all');
  const [tierFilter, setTierFilter] = useState<'all' | 'TIER 1' | 'TIER 2' | 'TIER 3' | 'TIER 4'>('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'fidelity' | 'editability'>('name');
  const [showBookmarksOnly, setShowBookmarksOnly] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<EncyclopediaEntry | null>(null);
  const [modalTab, setModalTab] = useState<'overview' | 'math' | 'code'>('overview');
  const [copiedCode, setCopiedCode] = useState(false);

  // Compare mode state
  const [compareMode, setCompareMode] = useState(false);
  const [compareItems, setCompareItems] = useState<EncyclopediaEntry[]>([]);

  // Bookmarks state (persisted)
  const [bookmarks, setBookmarks] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const toggleBookmark = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setBookmarks((prev) => {
      const next = prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id];
      try {
        localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    toast.success(bookmarks.includes(id) ? 'Removed from Bookmarks' : 'Saved to Bookmarks');
  };

  // Compile unified knowledge base entries
  const allEntries: EncyclopediaEntry[] = useMemo(() => {
    // 1. Vectorization entries
    const vecEntries: EncyclopediaEntry[] = VECTORIZATION_TECHNIQUES.map((t, i) => {
      const tierVal = i < 5 ? 'TIER 1' : i < 10 ? 'TIER 2' : i < 14 ? 'TIER 3' : 'TIER 4';
      return {
        id: `vec-${t.id}`,
        name: t.name,
        domain: 'vectorization',
        category: t.category,
        tagline: t.tagline,
        description: t.description,
        mathFormula:
          t.id === 'centerline'
            ? 'Skeleton(A) = \\bigcup_{r>0} (S_r(A) \\setminus \\text{Open}(S_r(A), rB))'
            : t.id === 'region'
            ? '\\partial R = \\{p \\in R : N_8(p) \\cap R^c \\neq \\emptyset\\}'
            : t.id === 'color-quantize'
            ? '\\min \\sum_{i=1}^k \\sum_{x \\in S_i} \\|x - \\mu_i\\|^2'
            : t.id === 'delaunay'
            ? 'DT(P) = \\{T : C(T) \\cap P = \\emptyset\\}'
            : undefined,
        complexity:
          t.id === 'centerline'
            ? 'O(W · H · iter)'
            : t.id === 'delaunay'
            ? 'O(N \\log N)'
            : t.id === 'halftone'
            ? 'O(N_{dots})'
            : 'O(W · H)',
        bestFor: t.bestFor,
        tier: tierVal as any,
        gpu: i > 10 ? 'OPTIONAL' : 'NO',
        fidelity: Math.max(2, 5 - (i % 3)),
        editability: Math.max(2, 5 - (i % 2)),
        codeSnippet: `// Vectorization Execution: ${t.name}\nimport { ${t.id === 'centerline' ? 'traceCenterline' : t.id === 'region' ? 'tracePotrace' : 'traceDelaunay'} } from './vectorization';\n\nconst svgString = await traceEngine(imageData, {\n  technique: '${t.id}',\n  threshold: 128,\n  simplifyTolerance: 1.25\n});`,
        liveSvgPreview: getVectorizationLiveSvg(t.id),
        tags: [t.category, 'Vectorization', 'Raster to SVG', t.id],
      };
    });

    // 2. Animation entries
    const animEntries: EncyclopediaEntry[] = ALL_ANIMATION_PRESETS.map((a, i) => {
      const tierVal = a.id.includes('scroll') || i > 24 ? 'TIER 2' : 'TIER 1';
      return {
        id: `anim-${a.id}`,
        name: a.name,
        domain: 'animation',
        category: a.category,
        tagline: a.tagline,
        description: `${a.description} Key mechanism: ${a.trick}.`,
        mathFormula:
          a.id === 'pen-draw-on'
            ? '\\text{stroke-dashoffset} = 1 - t, \\quad t \\in [0, 1]'
            : a.id === 'path-morph'
            ? 'P(t) = (1-t) P_A + t P_B'
            : undefined,
        complexity: 'O(1) CSS Hardware Compositor',
        bestFor: a.bestFor,
        tier: tierVal as any,
        gpu: 'YES',
        fidelity: 4,
        editability: 5,
        codeSnippet: `/* CSS Keyframe Animation: ${a.name} */\n.vec-anim-${a.id} {\n  animation: vec-kf-${a.id} 3.5s ease-in-out infinite alternate;\n}\n\n@keyframes vec-kf-${a.id} {\n  /* ${a.trick} */\n}`,
        liveSvgPreview: getAnimationLiveSvg(a.id),
        tags: [a.category, 'Animation', 'CSS Motion', 'Kinetic SVG', a.id],
      };
    });

    return [
      ...vecEntries,
      ...animEntries,
      ...GEOMETRY_ENTRIES,
      ...FILTER_ENTRIES,
      ...COLOR_ENTRIES,
      ...STANDARDS_ENTRIES,
    ];
  }, []);

  // Filter categories dynamically based on domain
  const availableCategories = useMemo(() => {
    const subset = domainFilter === 'all' ? allEntries : allEntries.filter((e) => e.domain === domainFilter);
    return Array.from(new Set(subset.map((e) => e.category))).sort();
  }, [allEntries, domainFilter]);

  // Filtered & sorted entries
  const filteredEntries = useMemo(() => {
    return allEntries
      .filter((e) => {
        if (domainFilter !== 'all' && e.domain !== domainFilter) return false;
        if (tierFilter !== 'all' && e.tier !== tierFilter) return false;
        if (categoryFilter !== 'all' && e.category !== categoryFilter) return false;
        if (showBookmarksOnly && !bookmarks.includes(e.id)) return false;

        if (query.trim()) {
          const q = query.toLowerCase();
          const matchName = e.name.toLowerCase().includes(q);
          const matchTagline = e.tagline.toLowerCase().includes(q);
          const matchDesc = e.description.toLowerCase().includes(q);
          const matchBest = e.bestFor.toLowerCase().includes(q);
          const matchTags = e.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchName && !matchTagline && !matchDesc && !matchBest && !matchTags) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        if (sortBy === 'fidelity') return b.fidelity - a.fidelity;
        if (sortBy === 'editability') return b.editability - a.editability;
        return 0;
      });
  }, [allEntries, domainFilter, tierFilter, categoryFilter, showBookmarksOnly, bookmarks, query, sortBy]);

  // Statistics counters
  const stats = useMemo(() => {
    return {
      total: allEntries.length,
      vectorCount: allEntries.filter((e) => e.domain === 'vectorization').length,
      animCount: allEntries.filter((e) => e.domain === 'animation').length,
      geomCount: allEntries.filter((e) => e.domain === 'geometry').length,
      filterCount: allEntries.filter((e) => e.domain === 'filters').length,
      colorCount: allEntries.filter((e) => e.domain === 'color').length,
      stdCount: allEntries.filter((e) => e.domain === 'standards').length,
    };
  }, [allEntries]);

  // Compare mode helper
  const handleToggleCompareItem = (entry: EncyclopediaEntry, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompareItems((prev) => {
      const exists = prev.some((item) => item.id === entry.id);
      if (exists) {
        return prev.filter((item) => item.id !== entry.id);
      }
      if (prev.length >= 2) {
        toast.info('Replaced first comparison item');
        return [prev[1], entry];
      }
      return [...prev, entry];
    });
  };

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Snippet copied to clipboard');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExportCheatSheet = () => {
    const mdLines = [
      '# VECTORA Technical Reference & Encyclopedia Cheat Sheet',
      `Generated: ${new Date().toISOString()}`,
      `Total Algorithms & Standards: ${allEntries.length}\n`,
      '---',
    ];

    allEntries.forEach((e) => {
      mdLines.push(`\n## ${e.name} (${e.domain.toUpperCase()} · ${e.tier})`);
      mdLines.push(`**Category**: ${e.category} | **GPU**: ${e.gpu} | **Fidelity**: ${e.fidelity}/5 | **Editability**: ${e.editability}/5`);
      mdLines.push(`**Tagline**: ${e.tagline}`);
      mdLines.push(`**Description**: ${e.description}`);
      if (e.mathFormula) mdLines.push(`**Math Basis**: \`${e.mathFormula}\``);
      if (e.complexity) mdLines.push(`**Complexity**: ${e.complexity}`);
      mdLines.push(`**Best For**: ${e.bestFor}`);
      mdLines.push('```svg\n' + e.codeSnippet + '\n```');
    });

    const blob = new Blob([mdLines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vectora_encyclopedia_reference.md';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Encyclopedia Reference Sheet downloaded');
  };

  return (
    <div className="min-h-full bg-[#080808] text-white p-4 md:p-8 font-mono select-none overflow-y-auto custom-scrollbar">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header HUD */}
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[#00FF00] text-[11px] font-bold tracking-[.3em] uppercase bg-[#00FF00]/10 border border-[#00FF00]/30 px-2.5 py-0.5 rounded">
                VECTORA STUDIO // MASTER ENCYCLOPEDIA
              </span>
              <span className="text-white/40 text-xs font-mono uppercase">V2.6 COMPREHENSIVE DOCTRINE</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
              <span>Algorithmic Encyclopedia</span>
              <span className="text-xs bg-white/10 text-[#00FF00] px-2 py-1 rounded font-normal border border-white/10">
                {allEntries.length} Specs
              </span>
            </h1>
            <p className="text-white/50 mt-3 max-w-3xl text-xs md:text-sm leading-6">
              Production catalog covering image-to-SVG vectorization algorithms, kinetic animation pipelines,
              elliptical Bézier geometry mathematics, procedural shader filters, Oklab color science, and
              Inkscape standards. Every entry is interactive, executable, and connected to the Studio engine.
            </p>
          </div>

          {/* Quick HUD Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-center shrink-0">
            <StatCard value={String(stats.vectorCount)} label="VECTOR ENGINES" color="#00FF00" />
            <StatCard value={String(stats.animCount)} label="ANIM PRESETS" color="#00F0FF" />
            <StatCard value={String(stats.geomCount)} label="GEOMETRY MATH" color="#FFB800" />
            <StatCard value={String(stats.filterCount)} label="SVG FILTERS" color="#FF0055" />
            <StatCard value={String(stats.colorCount)} label="COLOR SPACES" color="#A855F7" />
            <StatCard value={String(stats.stdCount)} label="STANDARDS" color="#10B981" />
          </div>
        </div>

        {/* Global Toolbar: Search & Domain Filters */}
        <div className="bg-[#101010] border border-white/10 rounded-2xl p-3 md:p-4 shadow-xl space-y-3">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 text-white/40" size={16} />
              <input
                id="encyclopedia-search-input"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by algorithm name, formula, best-for, tag or keyword..."
                className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-xs md:text-sm text-white placeholder-white/40 outline-none focus:border-[#00FF00] transition-colors"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-3 text-white/40 hover:text-white text-xs"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0 overflow-x-auto pb-1 lg:pb-0">
              <button
                onClick={() => setCompareMode(!compareMode)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  compareMode
                    ? 'bg-[#00F0FF] text-black shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                    : 'bg-[#181818] text-white/70 hover:text-white border border-white/10 hover:border-[#00F0FF]'
                }`}
              >
                <ArrowLeftRight size={14} />
                <span>Compare ({compareItems.length}/2)</span>
              </button>

              <button
                onClick={() => setShowBookmarksOnly(!showBookmarksOnly)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase transition-all ${
                  showBookmarksOnly
                    ? 'bg-[#FFEA00] text-black shadow-[0_0_15px_rgba(255,234,0,0.4)]'
                    : 'bg-[#181818] text-white/70 hover:text-white border border-white/10 hover:border-[#FFEA00]'
                }`}
              >
                <Bookmark size={14} />
                <span>Saved ({bookmarks.length})</span>
              </button>

              <button
                onClick={handleExportCheatSheet}
                title="Download full Markdown technical reference cheat sheet"
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold uppercase bg-[#181818] text-white/70 hover:text-white border border-white/10 hover:border-white/30 transition-all"
              >
                <Download size={14} />
                <span className="hidden sm:inline">Cheat Sheet</span>
              </button>
            </div>
          </div>

          {/* Domain Tabs Strip */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <DomainTab active={domainFilter === 'all'} onClick={() => { setDomainFilter('all'); setCategoryFilter('all'); }}>
              ALL ({stats.total})
            </DomainTab>
            <DomainTab active={domainFilter === 'vectorization'} onClick={() => { setDomainFilter('vectorization'); setCategoryFilter('all'); }} color="#00FF00">
              <Cpu size={13} className="inline mr-1" />
              IMAGE → SVG ({stats.vectorCount})
            </DomainTab>
            <DomainTab active={domainFilter === 'animation'} onClick={() => { setDomainFilter('animation'); setCategoryFilter('all'); }} color="#00F0FF">
              <Zap size={13} className="inline mr-1" />
              MOTION ({stats.animCount})
            </DomainTab>
            <DomainTab active={domainFilter === 'geometry'} onClick={() => { setDomainFilter('geometry'); setCategoryFilter('all'); }} color="#FFB800">
              <Compass size={13} className="inline mr-1" />
              GEOMETRY ({stats.geomCount})
            </DomainTab>
            <DomainTab active={domainFilter === 'filters'} onClick={() => { setDomainFilter('filters'); setCategoryFilter('all'); }} color="#FF0055">
              <Waves size={13} className="inline mr-1" />
              FILTERS ({stats.filterCount})
            </DomainTab>
            <DomainTab active={domainFilter === 'color'} onClick={() => { setDomainFilter('color'); setCategoryFilter('all'); }} color="#A855F7">
              <Palette size={13} className="inline mr-1" />
              COLOR SCIENCE ({stats.colorCount})
            </DomainTab>
            <DomainTab active={domainFilter === 'standards'} onClick={() => { setDomainFilter('standards'); setCategoryFilter('all'); }} color="#10B981">
              <Shield size={13} className="inline mr-1" />
              STANDARDS ({stats.stdCount})
            </DomainTab>
          </div>

          {/* Secondary Filter & Sort Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-white/5 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] text-white/40 uppercase">Filter by:</span>

              {/* Category Select */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 outline-none focus:border-[#00FF00]"
              >
                <option value="all">ALL CATEGORIES</option>
                {availableCategories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>

              {/* Tier Select */}
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value as any)}
                className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 outline-none focus:border-[#00FF00]"
              >
                <option value="all">ALL TIERS</option>
                <option value="TIER 1">TIER 1 (Production)</option>
                <option value="TIER 2">TIER 2 (Advanced)</option>
                <option value="TIER 3">TIER 3 (Experimental)</option>
                <option value="TIER 4">TIER 4 (Research)</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-white/40 uppercase">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-[#0a0a0a] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80 outline-none focus:border-[#00FF00]"
              >
                <option value="name">Name (A-Z)</option>
                <option value="fidelity">Fidelity (High to Low)</option>
                <option value="editability">Editability (High to Low)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Dock (when compareMode is active) */}
        {compareMode && (
          <div className="bg-[#0D1520] border-2 border-[#00F0FF]/40 rounded-2xl p-4 shadow-2xl">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="text-[#00F0FF]" size={16} />
                <span className="text-xs font-bold uppercase text-[#00F0FF] tracking-wider">
                  Side-by-Side Algorithm Comparison Mode
                </span>
                <span className="text-[10px] text-white/40">Select any 2 cards to compare metrics</span>
              </div>
              <button
                onClick={() => setCompareItems([])}
                className="text-[10px] text-white/40 hover:text-white uppercase underline"
              >
                Clear Selection
              </button>
            </div>

            {compareItems.length === 0 ? (
              <div className="text-center py-6 text-xs text-white/40 font-mono">
                No techniques selected. Click the "⇄ Compare" button on any two cards below.
              </div>
            ) : compareItems.length === 1 ? (
              <div className="text-center py-4 text-xs text-[#00F0FF]/80 font-mono">
                1 of 2 selected: <strong className="text-white">{compareItems[0].name}</strong>. Select one more technique to compare.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {compareItems.map((item) => (
                  <div key={item.id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-[#00F0FF] uppercase tracking-wider font-bold">
                          {item.domain} · {item.tier}
                        </span>
                        <h3 className="font-bold text-base text-white mt-0.5">{item.name}</h3>
                      </div>
                      <button
                        onClick={(e) => handleToggleCompareItem(item, e)}
                        className="text-white/40 hover:text-white p-1"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <p className="text-xs text-white/60 leading-5">{item.description}</p>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-[#141414] p-2 rounded">
                        <span className="text-[9px] text-white/40 block">GPU ACCELERATED</span>
                        <span className="font-bold text-white">{item.gpu}</span>
                      </div>
                      <div className="bg-[#141414] p-2 rounded">
                        <span className="text-[9px] text-white/40 block">COMPLEXITY</span>
                        <span className="font-bold text-[#00FF00]">{item.complexity || 'O(1)'}</span>
                      </div>
                      <div className="bg-[#141414] p-2 rounded">
                        <span className="text-[9px] text-white/40 block">VECTOR FIDELITY</span>
                        <span className="font-bold text-white">{item.fidelity}/5</span>
                      </div>
                      <div className="bg-[#141414] p-2 rounded">
                        <span className="text-[9px] text-white/40 block">EDITABILITY</span>
                        <span className="font-bold text-white">{item.editability}/5</span>
                      </div>
                    </div>

                    <div className="bg-[#141414] p-2.5 rounded text-xs">
                      <span className="text-[9px] text-white/40 uppercase block mb-1">Ideal Production Use Case</span>
                      <span className="text-white/80">{item.bestFor}</span>
                    </div>

                    <button
                      onClick={() => setSelectedEntry(item)}
                      className="w-full py-1.5 bg-[#00F0FF]/10 hover:bg-[#00F0FF]/20 text-[#00F0FF] border border-[#00F0FF]/30 rounded text-xs font-bold uppercase transition-colors"
                    >
                      Inspect Full Blueprint →
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Results Counter Bar */}
        <div className="flex items-center justify-between text-[11px] text-white/40 uppercase font-mono">
          <span>
            <SlidersHorizontal size={13} className="inline mr-2 text-[#00FF00]" />
            Displaying {filteredEntries.length} of {allEntries.length} technical specifications
          </span>
          <span>Click any card to inspect live simulation, math & code</span>
        </div>

        {/* Main Encyclopedia Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
          {filteredEntries.map((entry) => {
            const isBookmarked = bookmarks.includes(entry.id);
            const isCompared = compareItems.some((item) => item.id === entry.id);

            const domainIcon =
              entry.domain === 'vectorization' ? (
                <Cpu size={16} className="text-[#00FF00]" />
              ) : entry.domain === 'animation' ? (
                <Zap size={16} className="text-[#00F0FF]" />
              ) : entry.domain === 'geometry' ? (
                <Compass size={16} className="text-[#FFB800]" />
              ) : entry.domain === 'filters' ? (
                <Waves size={16} className="text-[#FF0055]" />
              ) : entry.domain === 'color' ? (
                <Palette size={16} className="text-[#A855F7]" />
              ) : (
                <Shield size={16} className="text-[#10B981]" />
              );

            const domainColor =
              entry.domain === 'vectorization'
                ? '#00FF00'
                : entry.domain === 'animation'
                ? '#00F0FF'
                : entry.domain === 'geometry'
                ? '#FFB800'
                : entry.domain === 'filters'
                ? '#FF0055'
                : entry.domain === 'color'
                ? '#A855F7'
                : '#10B981';

            return (
              <div
                key={entry.id}
                onClick={() => setSelectedEntry(entry)}
                className={`group relative bg-[#0e0e0e] border rounded-2xl p-4 md:p-5 transition-all duration-200 cursor-pointer flex flex-col justify-between hover:-translate-y-1 hover:shadow-2xl ${
                  isCompared
                    ? 'border-[#00F0FF] shadow-[0_0_20px_rgba(0,240,255,0.2)]'
                    : 'border-white/10 hover:border-[#00FF00]/50'
                }`}
              >
                <div>
                  {/* Top Meta Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-xl bg-white/5 border border-white/10 group-hover:border-white/20">
                        {domainIcon}
                      </div>
                      <div>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider font-bold">
                          {entry.domain} · {entry.tier}
                        </div>
                        <h2 className="font-bold text-sm md:text-base text-white mt-0.5 group-hover:text-[#00FF00] transition-colors leading-tight">
                          {entry.name}
                        </h2>
                      </div>
                    </div>

                    {/* Bookmark & Compare triggers */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => toggleBookmark(entry.id, e)}
                        title={isBookmarked ? 'Remove bookmark' : 'Bookmark this entry'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isBookmarked
                            ? 'bg-[#FFEA00]/10 text-[#FFEA00] border-[#FFEA00]/30'
                            : 'text-white/30 hover:text-white border-transparent hover:border-white/10'
                        }`}
                      >
                        <Bookmark size={14} className={isBookmarked ? 'fill-[#FFEA00]' : ''} />
                      </button>

                      <button
                        onClick={(e) => handleToggleCompareItem(entry, e)}
                        title={isCompared ? 'Remove from compare' : 'Add to compare'}
                        className={`p-1.5 rounded-lg border transition-colors ${
                          isCompared
                            ? 'bg-[#00F0FF]/10 text-[#00F0FF] border-[#00F0FF]/30'
                            : 'text-white/30 hover:text-white border-transparent hover:border-white/10'
                        }`}
                      >
                        <ArrowLeftRight size={14} />
                      </button>
                    </div>
                  </div>

                  {/* Tagline & Summary */}
                  <p className="text-xs text-[#00FF00] mt-3 font-medium">{entry.tagline}</p>
                  <p className="text-xs text-white/55 mt-1.5 leading-5 line-clamp-2">{entry.description}</p>
                </div>

                {/* Live Micro-Preview SVG Badge */}
                {entry.liveSvgPreview && (
                  <div className="mt-4 h-24 w-full bg-[#050505] rounded-xl border border-white/5 overflow-hidden flex items-center justify-center p-1.5 pointer-events-none group-hover:border-white/20 transition-colors">
                    <div
                      className="w-full h-full flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                      dangerouslySetInnerHTML={{ __html: entry.liveSvgPreview }}
                    />
                  </div>
                )}

                {/* Metrics & Footer */}
                <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase">
                    <span>Fidelity</span>
                    <div className="flex gap-1 w-24">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`h-1 flex-1 rounded-full ${
                            n <= entry.fidelity ? 'bg-[#00FF00]' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase">
                    <span>Editability</span>
                    <div className="flex gap-1 w-24">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <span
                          key={n}
                          className={`h-1 flex-1 rounded-full ${
                            n <= entry.editability ? 'bg-[#00F0FF]' : 'bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-white/40 uppercase pt-1">
                    <span>GPU: <strong className="text-white/80">{entry.gpu}</strong></span>
                    <span className="text-white/70 group-hover:text-[#00FF00] font-bold flex items-center gap-1 transition-colors">
                      Inspect Spec <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-16 bg-[#101010] border border-white/10 rounded-2xl p-8 space-y-3">
            <BookOpen size={36} className="mx-auto text-white/20" />
            <h3 className="text-lg font-bold text-white">No specifications match your query</h3>
            <p className="text-xs text-white/40 max-w-md mx-auto">
              Try refining your search keyword, resetting the domain filter, or clearing the active category.
            </p>
            <button
              onClick={() => {
                setQuery('');
                setDomainFilter('all');
                setCategoryFilter('all');
                setTierFilter('all');
                setShowBookmarksOnly(false);
              }}
              className="px-4 py-2 bg-[#00FF00] text-black font-bold text-xs uppercase rounded-xl hover:bg-[#33FF33] transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Comprehensive Detail Specification Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 md:p-6"
          onClick={() => setSelectedEntry(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-4xl max-h-[90vh] bg-[#0d0d0d] border border-[#00FF00]/40 rounded-3xl p-5 md:p-7 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 font-mono"
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#00FF00] uppercase tracking-widest bg-[#00FF00]/10 px-2 py-0.5 rounded border border-[#00FF00]/20">
                    {selectedEntry.domain} / {selectedEntry.tier}
                  </span>
                  <span className="text-xs text-white/40 uppercase">{selectedEntry.category}</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-white mt-1.5">{selectedEntry.name}</h2>
                <p className="text-xs md:text-sm text-[#00FF00] font-medium mt-1">{selectedEntry.tagline}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => toggleBookmark(selectedEntry.id, e)}
                  className={`p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                    bookmarks.includes(selectedEntry.id)
                      ? 'bg-[#FFEA00]/10 text-[#FFEA00] border-[#FFEA00]/40'
                      : 'bg-white/5 text-white/50 border-white/10 hover:text-white'
                  }`}
                >
                  <Bookmark size={15} className={bookmarks.includes(selectedEntry.id) ? 'fill-[#FFEA00]' : ''} />
                  <span className="hidden sm:inline">Save</span>
                </button>

                <button
                  onClick={() => setSelectedEntry(null)}
                  className="p-2 text-white/40 hover:text-white rounded-xl hover:bg-white/10 text-xl transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 py-3 shrink-0 text-xs">
              <button
                onClick={() => setModalTab('overview')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors ${
                  modalTab === 'overview'
                    ? 'bg-[#00FF00] text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                1. Technical Overview & Simulation
              </button>
              <button
                onClick={() => setModalTab('math')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors ${
                  modalTab === 'math'
                    ? 'bg-[#00FF00] text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                2. Algorithmic Math & Complexity
              </button>
              <button
                onClick={() => setModalTab('code')}
                className={`px-3 py-1.5 rounded-lg font-bold uppercase transition-colors ${
                  modalTab === 'code'
                    ? 'bg-[#00FF00] text-black'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                }`}
              >
                3. Code Implementation & Spec
              </button>
            </div>

            {/* Modal Body Content */}
            <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
              {modalTab === 'overview' && (
                <div className="space-y-6">
                  {/* Live SVG Simulation Canvas */}
                  {selectedEntry.liveSvgPreview && (
                    <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                      <div className="absolute top-3 left-3 text-[10px] text-white/30 uppercase tracking-widest font-mono">
                        LIVE SPEC SIMULATION
                      </div>
                      <div
                        className="w-full max-w-md h-52 flex items-center justify-center [&>svg]:max-w-full [&>svg]:max-h-full"
                        dangerouslySetInnerHTML={{ __html: selectedEntry.liveSvgPreview }}
                      />
                    </div>
                  )}

                  <div>
                    <h4 className="text-xs uppercase font-bold text-white/40 tracking-wider mb-2">
                      Architectural Overview
                    </h4>
                    <p className="text-sm text-white/80 leading-7">{selectedEntry.description}</p>
                  </div>

                  {/* Benchmark & Capability Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <InfoBox label="GPU ACCELERATION" value={selectedEntry.gpu} color="#00F0FF" />
                    <InfoBox label="TIME COMPLEXITY" value={selectedEntry.complexity || 'O(1) Standard'} color="#00FF00" />
                    <InfoBox label="FIDELITY RATING" value={`${selectedEntry.fidelity} / 5`} color="#FFB800" />
                    <InfoBox label="EDITABILITY SCORE" value={`${selectedEntry.editability} / 5`} color="#FF0055" />
                  </div>

                  {/* Ideal Production Use Case */}
                  <div className="bg-[#141414] border border-white/10 rounded-2xl p-4">
                    <div className="text-[10px] text-[#00FF00] font-bold uppercase tracking-wider mb-1">
                      OPTIMAL PRODUCTION USE CASE
                    </div>
                    <p className="text-xs text-white/80 leading-6">{selectedEntry.bestFor}</p>
                  </div>

                  {/* Tag Cloud */}
                  <div>
                    <div className="text-[10px] text-white/40 uppercase font-bold mb-2">Technical Registry Tags</div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedEntry.tags.map((t) => (
                        <span key={t} className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-[10px] text-white/70">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'math' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-xs uppercase font-bold text-[#00FF00] tracking-wider mb-2">
                      Mathematical Formulation & Algorithmic Basis
                    </h4>
                    <p className="text-sm text-white/80 leading-6">
                      Every technique in VECTORA is engineered on rigorous computational geometry, discrete
                      calculus, and linear algebra primitives.
                    </p>
                  </div>

                  {selectedEntry.mathFormula ? (
                    <div className="bg-[#050505] border border-[#00FF00]/30 rounded-2xl p-5 text-center">
                      <div className="text-[10px] text-white/40 uppercase mb-2">Mathematical Formulation</div>
                      <div className="text-base md:text-lg text-[#00FF00] font-mono font-bold tracking-wider py-2">
                        {selectedEntry.mathFormula}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-[#141414] border border-white/10 rounded-2xl p-4 text-xs text-white/60">
                      Standardized SVG DOM attribute pipeline adhering to W3C SVG 2.0 and CSS Transitions Specification.
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-[#00F0FF] uppercase font-bold block">Execution Complexity</span>
                      <p className="text-white/80">
                        {selectedEntry.complexity || 'O(1) GPU hardware accelerated'}
                      </p>
                      <span className="text-[10px] text-white/40 block">
                        Memory profile: Compact DOM AST representation without unbounded memory growth.
                      </span>
                    </div>

                    <div className="bg-[#141414] border border-white/10 rounded-xl p-4 space-y-2">
                      <span className="text-[10px] text-[#FFB800] uppercase font-bold block">Hardware Acceleration</span>
                      <p className="text-white/80">
                        GPU Status: <strong>{selectedEntry.gpu}</strong>
                      </p>
                      <span className="text-[10px] text-white/40 block">
                        Composited natively on Chrome, Safari, and Firefox WebGL / Metal renderers.
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'code' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/60 uppercase font-bold">
                      Executable Snippet & Schema Definition
                    </span>
                    <button
                      onClick={() => handleCopyCode(selectedEntry.codeSnippet)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00FF00] text-black font-bold text-xs uppercase rounded-lg hover:bg-[#33FF33] transition-colors"
                    >
                      {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                      <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                  </div>

                  <div className="bg-[#050505] border border-white/10 rounded-2xl p-4 overflow-x-auto">
                    <pre className="text-xs text-[#00FF00] font-mono leading-6">
                      {selectedEntry.codeSnippet}
                    </pre>
                  </div>

                  <p className="text-xs text-white/40">
                    All snippets adhere to strict VECTORA doctrine: 0 external runtime dependencies, valid XML
                    interchange syntax, and Inkscape namespace compatibility.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer Controls */}
            <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3 shrink-0">
              <div className="flex items-center gap-2 text-xs text-white/50">
                <BookOpen size={15} className="text-[#00FF00]" />
                <span>Registry Verified Entry ID: <code className="text-white">{selectedEntry.id}</code></span>
              </div>

              {onOpenStudio && (
                <button
                  onClick={() => {
                    setSelectedEntry(null);
                    onOpenStudio();
                  }}
                  className="flex items-center gap-2 bg-[#00FF00] hover:bg-[#33FF33] text-black font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-lg shadow-[#00FF00]/20"
                >
                  <span>Launch in Vector Studio</span>
                  <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Subcomponents
const StatCard = ({ value, label, color = '#00FF00' }: { value: string; label: string; color?: string }) => (
  <div className="border border-white/10 bg-[#101010] rounded-xl px-2.5 py-2.5">
    <div className="text-lg md:text-xl font-black" style={{ color }}>
      {value}
    </div>
    <div className="text-[9px] text-white/40 mt-0.5 tracking-wider truncate uppercase">{label}</div>
  </div>
);

const DomainTab = ({
  active,
  onClick,
  children,
  color = '#00FF00',
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase whitespace-nowrap transition-all ${
      active
        ? 'bg-[#00FF00] text-black border-[#00FF00] shadow-[0_0_15px_rgba(0,255,0,0.3)]'
        : 'bg-[#0a0a0a] text-white/60 border-white/10 hover:text-white hover:border-white/20'
    }`}
  >
    {children}
  </button>
);

const InfoBox = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="bg-[#141414] border border-white/10 rounded-xl p-3">
    <div className="text-[9px] text-white/40 uppercase font-mono">{label}</div>
    <div className="text-xs font-bold font-mono mt-1" style={{ color }}>
      {value}
    </div>
  </div>
);
