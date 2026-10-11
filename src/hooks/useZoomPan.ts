import React, { useState, useRef, useEffect, useCallback } from 'react';

export interface PanOffset {
  x: number;
  y: number;
}

export interface UseZoomPanOptions {
  initialZoom?: number;
  initialPan?: PanOffset;
  minZoom?: number;
  maxZoom?: number;
  zoomSpeed?: number;
  // Optional controlled state from external parent
  externalZoom?: number;
  externalPan?: PanOffset;
  onUpdate?: (settings: { zoom: number; pan: PanOffset }) => void;
}

export interface UseZoomPanReturn {
  zoom: number;
  pan: PanOffset;
  isPanning: boolean;
  containerRef: React.RefObject<HTMLDivElement | null>;
  zoomIn: (delta?: number) => void;
  zoomOut: (delta?: number) => void;
  setZoom: (targetZoom: number) => void;
  setPan: (targetPan: PanOffset) => void;
  resetView: () => void;
  fitToView: (factor?: number) => void;
  handleMouseDown: (e: React.MouseEvent | MouseEvent) => void;
  handleWheel: (e: WheelEvent | React.WheelEvent) => void;
  transformStyle: React.CSSProperties;
}

/**
 * Zoom and pan utility hook for canvas and vector viewport interactions.
 * Enables smooth scroll-to-zoom (with focal centering) and drag-to-pan within containers.
 */
export function useZoomPan(options: UseZoomPanOptions = {}): UseZoomPanReturn {
  const {
    initialZoom = 1.0,
    initialPan = { x: 0, y: 0 },
    minZoom = 0.1,
    maxZoom = 8.0,
    zoomSpeed = 0.12,
    externalZoom,
    externalPan,
    onUpdate,
  } = options;

  const [internalZoom, setInternalZoom] = useState<number>(initialZoom);
  const [internalPan, setInternalPan] = useState<PanOffset>(initialPan);
  const [isPanning, setIsPanning] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const startPanRef = useRef<{ clientX: number; clientY: number; initialPan: PanOffset }>({
    clientX: 0,
    clientY: 0,
    initialPan: { x: 0, y: 0 },
  });

  const zoom = externalZoom !== undefined ? externalZoom : internalZoom;
  const pan = externalPan !== undefined ? externalPan : internalPan;

  // Sync internal refs for listeners
  const stateRef = useRef({ zoom, pan, isPanning, minZoom, maxZoom, zoomSpeed, onUpdate });
  stateRef.current = { zoom, pan, isPanning, minZoom, maxZoom, zoomSpeed, onUpdate };

  const commitUpdate = useCallback((newZoom: number, newPan: PanOffset) => {
    const clampedZoom = parseFloat(Math.min(maxZoom, Math.max(minZoom, newZoom)).toFixed(2));
    const roundedPan = {
      x: Math.round(newPan.x),
      y: Math.round(newPan.y),
    };

    setInternalZoom(clampedZoom);
    setInternalPan(roundedPan);

    if (stateRef.current.onUpdate) {
      stateRef.current.onUpdate({ zoom: clampedZoom, pan: roundedPan });
    }
  }, [maxZoom, minZoom]);

  const zoomIn = useCallback((delta = 0.15) => {
    const current = stateRef.current;
    const nextZoom = parseFloat(Math.min(current.maxZoom, current.zoom + delta).toFixed(2));
    commitUpdate(nextZoom, current.pan);
  }, [commitUpdate]);

  const zoomOut = useCallback((delta = 0.15) => {
    const current = stateRef.current;
    const nextZoom = parseFloat(Math.max(current.minZoom, current.zoom - delta).toFixed(2));
    commitUpdate(nextZoom, current.pan);
  }, [commitUpdate]);

  const setZoom = useCallback((targetZoom: number) => {
    commitUpdate(targetZoom, stateRef.current.pan);
  }, [commitUpdate]);

  const setPan = useCallback((targetPan: PanOffset) => {
    commitUpdate(stateRef.current.zoom, targetPan);
  }, [commitUpdate]);

  const resetView = useCallback(() => {
    commitUpdate(1.0, { x: 0, y: 0 });
  }, [commitUpdate]);

  const fitToView = useCallback((factor = 0.85) => {
    commitUpdate(factor, { x: 0, y: 0 });
  }, [commitUpdate]);

  // Focal point wheel zoom
  const handleWheel = useCallback((e: WheelEvent | React.WheelEvent) => {
    const target = e.target as HTMLElement | null;
    if (target && target.closest('select, input, textarea, button, [data-scrollable="true"], .custom-scrollbar')) {
      return;
    }

    if ('preventDefault' in e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }

    const current = stateRef.current;
    const container = containerRef.current;

    const delta = e.deltaY;
    const zoomFactor = delta < 0 ? (1 + current.zoomSpeed) : (1 - current.zoomSpeed);
    const targetZoom = parseFloat(Math.min(current.maxZoom, Math.max(current.minZoom, current.zoom * zoomFactor)).toFixed(2));

    if (Math.abs(targetZoom - current.zoom) < 0.001) return;

    if (container) {
      const rect = container.getBoundingClientRect();
      const pointerX = e.clientX - rect.left - rect.width / 2;
      const pointerY = e.clientY - rect.top - rect.height / 2;

      // Adjust pan so the point under cursor remains stable
      const scaleRatio = targetZoom / current.zoom;
      const newPanX = pointerX - (pointerX - current.pan.x) * scaleRatio;
      const newPanY = pointerY - (pointerY - current.pan.y) * scaleRatio;

      commitUpdate(targetZoom, { x: newPanX, y: newPanY });
    } else {
      commitUpdate(targetZoom, current.pan);
    }
  }, [commitUpdate]);

  // Drag pan initiation
  const handleMouseDown = useCallback((e: React.MouseEvent | MouseEvent) => {
    // Left or middle mouse button
    if (e.button !== 0 && e.button !== 1) return;

    setIsPanning(true);
    startPanRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      initialPan: stateRef.current.pan,
    };
  }, []);

  // Global mousemove and mouseup listeners during panning
  useEffect(() => {
    if (!isPanning) return;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startPanRef.current.clientX;
      const dy = e.clientY - startPanRef.current.clientY;

      commitUpdate(stateRef.current.zoom, {
        x: startPanRef.current.initialPan.x + dx,
        y: startPanRef.current.initialPan.y + dy,
      });
    };

    const onMouseUp = () => {
      setIsPanning(false);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [isPanning, commitUpdate]);

  // Non-passive wheel event listener on containerRef to prevent browser zoom warning
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onNativeWheel = (e: WheelEvent) => {
      handleWheel(e);
    };

    el.addEventListener('wheel', onNativeWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', onNativeWheel);
    };
  }, [handleWheel]);

  // Touch support (pinch to zoom and drag pan)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let touchStartDist = 0;
    let touchStartZoom = 1;
    let touchStartPan = { x: 0, y: 0 };
    let touchStartPoint = { x: 0, y: 0 };

    const getDist = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartPoint = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartPan = stateRef.current.pan;
        setIsPanning(true);
      } else if (e.touches.length === 2) {
        touchStartDist = getDist(e.touches[0], e.touches[1]);
        touchStartZoom = stateRef.current.zoom;
        setIsPanning(false);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isPanning) {
        e.preventDefault();
        const dx = e.touches[0].clientX - touchStartPoint.x;
        const dy = e.touches[0].clientY - touchStartPoint.y;
        commitUpdate(stateRef.current.zoom, {
          x: touchStartPan.x + dx,
          y: touchStartPan.y + dy,
        });
      } else if (e.touches.length === 2 && touchStartDist > 0) {
        e.preventDefault();
        const dist = getDist(e.touches[0], e.touches[1]);
        const factor = dist / touchStartDist;
        const nextZoom = parseFloat((touchStartZoom * factor).toFixed(2));
        commitUpdate(nextZoom, stateRef.current.pan);
      }
    };

    const onTouchEnd = () => {
      setIsPanning(false);
      touchStartDist = 0;
    };

    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [isPanning, commitUpdate]);

  const transformStyle: React.CSSProperties = {
    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
  };

  return {
    zoom,
    pan,
    isPanning,
    containerRef,
    zoomIn,
    zoomOut,
    setZoom,
    setPan,
    resetView,
    fitToView,
    handleMouseDown,
    handleWheel,
    transformStyle,
  };
}
