import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  Sparkles,
  Zap,
  Cpu,
  Layers,
  Terminal,
  ArrowRight,
  Code2,
  CheckCircle2,
  Maximize2
} from 'lucide-react';

interface AnimatedIntroProps {
  onComplete: () => void;
  isOpen: boolean;
}

const TELEMETRY_LOGS = [
  'BOOTING VECTORA GEOMETRIC KERNEL v2.5...',
  'ALLOCATING RESOLUTION-INDEPENDENT VIEWBOX [0 0 1000 1000]',
  'PARSING INKSCAPE LAYER HIERARCHIES: 00_DEFS -> 07_FX',
  'INITIALIZING HARDWARE BEZIER RASTERIZER',
  'COMPOSING HIGH-CONTRAST BRUTALIST COLOR PALETTES',
  'SYNTHESIZING PARAMETRIC SVG FILTER MATRICES',
  'VECTORA GENERATIVE DESIGN ENGINE READY.',
];

export const AnimatedIntro: React.FC<AnimatedIntroProps> = ({ onComplete, isOpen }) => {
  const [logIndex, setLogIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState<'calibrating' | 'assembling' | 'ready'>('calibrating');

  // Advance telemetry logs and progress bar
  useEffect(() => {
    if (!isOpen) return;

    const logInterval = setInterval(() => {
      setLogIndex((prev) => {
        if (prev < TELEMETRY_LOGS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setStage('ready');
          return 100;
        }
        if (prev > 50 && stage === 'calibrating') {
          setStage('assembling');
        }
        return prev + 3;
      });
    }, 60);

    return () => {
      clearInterval(logInterval);
      clearInterval(progressInterval);
    };
  }, [isOpen, stage]);

  // Keyboard shortcut: Space or Enter to enter
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === ' ' || e.key === 'Enter' || e.key === 'Escape') {
        e.preventDefault();
        onComplete();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.4 }}
        className="fixed inset-0 z-50 bg-[#000000] flex flex-col justify-between p-6 md:p-12 overflow-hidden select-none font-mono text-[#FFFFFF]"
      >
        {/* Background Brutalist Blueprint Grid */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(to right, #222222 1px, transparent 1px),
              linear-gradient(to bottom, #222222 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Ambient Radial Laser Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-[#00FF00]/5 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Telemetry */}
        <div className="relative z-10 flex items-center justify-between border-b border-[#222222] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-[#00FF00] animate-pulse" />
            <span className="text-xs tracking-widest text-[#00FF00] font-bold">
              SYSTEM_STATUS: BOOT_SEQUENCE
            </span>
          </div>

          <div className="flex items-center gap-6 text-xs text-[#666666]">
            <span className="hidden sm:inline">COORDINATES: [0, 0, 1000, 1000]</span>
            <span>BUILD: v2.5.0-PRO</span>
            <button
              onClick={onComplete}
              className="px-3 py-1 bg-[#141414] hover:bg-[#222222] text-[#888888] hover:text-[#FFFFFF] border border-[#333333] transition-colors text-[11px] uppercase tracking-wider"
            >
              Skip (ESC)
            </button>
          </div>
        </div>

        {/* Center Stage: Animated Vector Emblem & Typography */}
        <div className="relative z-10 flex flex-col items-center justify-center my-auto py-8">
          {/* Animated SVG Precision Emblem */}
          <div className="relative w-48 h-48 sm:w-64 sm:h-64 flex items-center justify-center mb-8">
            <svg
              className="w-full h-full"
              viewBox="0 0 300 300"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="introGrad" x1="0" y1="0" x2="300" y2="300" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00FF00" />
                  <stop offset="50%" stopColor="#FFB800" />
                  <stop offset="100%" stopColor="#FF0055" />
                </linearGradient>
                <filter id="introGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="6" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Outer Rotating Coordinate Ring */}
              <motion.circle
                cx="150"
                cy="150"
                r="135"
                stroke="#222222"
                strokeWidth="1.5"
                strokeDasharray="4 8"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 30, ease: 'linear' }}
                style={{ originX: '150px', originY: '150px' }}
              />

              {/* Second Segmented Dial Ring */}
              <motion.circle
                cx="150"
                cy="150"
                r="110"
                stroke="#00FF00"
                strokeWidth="2"
                strokeDasharray="60 30 10 30"
                animate={{ rotate: -360 }}
                transition={{ repeat: Infinity, duration: 18, ease: 'linear' }}
                style={{ originX: '150px', originY: '150px' }}
              />

              {/* Laser Core Hexagon */}
              <motion.polygon
                points="150,55 230,105 230,195 150,245 70,195 70,105"
                stroke="url(#introGrad)"
                strokeWidth="3"
                fill="#050505"
                filter="url(#introGlow)"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />

              {/* Inner Diamond Crosshair */}
              <motion.polygon
                points="150,85 205,150 150,215 95,150"
                stroke="#00FF00"
                strokeWidth="1.5"
                fill="none"
                animate={{ scale: [0.95, 1.05, 0.95] }}
                transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
                style={{ originX: '150px', originY: '150px' }}
              />

              {/* Center Monogram */}
              <text
                x="150"
                y="166"
                textAnchor="middle"
                fill="#FFFFFF"
                fontSize="48"
                fontWeight="900"
                fontFamily="monospace"
                letterSpacing="2"
              >
                V
              </text>

              {/* Cardinal Precision Crosshairs */}
              <line x1="150" y1="20" x2="150" y2="45" stroke="#00FF00" strokeWidth="2" />
              <line x1="150" y1="255" x2="150" y2="280" stroke="#00FF00" strokeWidth="2" />
              <line x1="20" y1="150" x2="45" y2="150" stroke="#00FF00" strokeWidth="2" />
              <line x1="255" y1="150" x2="280" y2="150" stroke="#00FF00" strokeWidth="2" />
            </svg>
          </div>

          {/* Typography Header */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-center space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#111111] border border-[#00FF00]/40 text-[#00FF00] text-xs uppercase tracking-widest">
              <Zap className="w-3.5 h-3.5 fill-[#00FF00]" />
              <span>PRECISION GENERATIVE VECTOR ENGINE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter uppercase text-[#FFFFFF]">
              VECTORA<span className="text-[#00FF00]">.</span>
            </h1>

            <p className="text-xs sm:text-sm text-[#888888] max-w-xl mx-auto font-mono tracking-wide leading-relaxed">
              Fine Artistry • Mathematical Precision • Standards-Compliant Inkscape SVG Architecture
            </p>
          </motion.div>

          {/* Live Telemetry Log Feed */}
          <div className="w-full max-w-lg mt-8 p-3 bg-[#0A0A0A] border border-[#222222] font-mono text-left">
            <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-[#1F1F1F] text-[10px] text-[#666666]">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3 h-3 text-[#00FF00]" />
                <span>TELEMETRY FEED</span>
              </span>
              <span className="text-[#00FF00] font-bold">{progress}% READY</span>
            </div>

            <div className="h-12 overflow-hidden flex flex-col justify-end text-[11px] text-[#AAAAAA]">
              <p className="text-[#00FF00] font-bold truncate">
                &gt; {TELEMETRY_LOGS[logIndex]}
              </p>
              {logIndex > 0 && (
                <p className="text-[#444444] truncate">
                  &gt; {TELEMETRY_LOGS[logIndex - 1]}
                </p>
              )}
            </div>

            {/* Precision Progress Bar */}
            <div className="w-full h-1.5 bg-[#141414] border border-[#222222] mt-2 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-[#00FF00] via-[#FFB800] to-[#00FF00]"
                style={{ width: `${progress}%` }}
                transition={{ ease: 'easeOut' }}
              />
            </div>
          </div>
        </div>

        {/* Bottom Bar: Action Trigger */}
        <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between border-t border-[#222222] pt-4 gap-4">
          <div className="flex items-center gap-4 text-xs text-[#666666]">
            <span>LAYER SPEC: 00-07 STANDARD</span>
            <span>AST CODE ENGINE: ACTIVE</span>
          </div>

          <motion.button
            id="btn-launch-studio"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onComplete}
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-[#00FF00] hover:bg-[#33FF33] text-[#000000] font-black text-xs uppercase tracking-widest border border-[#00FF00] shadow-[0_0_20px_rgba(0,255,0,0.3)] transition-all cursor-pointer"
          >
            <span>ENTER STUDIO ENVIRONMENT</span>
            <ArrowRight className="w-4 h-4 stroke-[3]" />
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
