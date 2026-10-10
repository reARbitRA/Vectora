// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import { useZoomPan, type UseZoomPanReturn } from '../useZoomPan';

// @ts-ignore
globalThis.IS_REACT_ACT_ENVIRONMENT = true;

function setupHook(options = {}) {
  let hookReturn!: UseZoomPanReturn;
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);

  function TestComponent() {
    hookReturn = useZoomPan(options);
    return (
      <div
        ref={hookReturn.containerRef}
        data-testid="container"
        onMouseDown={hookReturn.handleMouseDown}
      >
        <div data-testid="artboard" style={hookReturn.transformStyle} />
      </div>
    );
  }

  act(() => {
    root.render(<TestComponent />);
  });

  return {
    getHook: () => hookReturn,
    container,
    cleanup: () => {
      act(() => {
        root.unmount();
      });
      container.remove();
    },
  };
}

describe('useZoomPan utility hook', () => {
  it('initializes with default values', () => {
    const { getHook, cleanup } = setupHook();
    expect(getHook().zoom).toBe(1.0);
    expect(getHook().pan).toEqual({ x: 0, y: 0 });
    expect(getHook().isPanning).toBe(false);
    expect(getHook().transformStyle.transform).toBe('translate(0px, 0px) scale(1)');
    cleanup();
  });

  it('handles zoomIn and zoomOut', () => {
    const { getHook, cleanup } = setupHook({ initialZoom: 1.0 });

    act(() => {
      getHook().zoomIn(0.2);
    });
    expect(getHook().zoom).toBe(1.2);
    expect(getHook().transformStyle.transform).toBe('translate(0px, 0px) scale(1.2)');

    act(() => {
      getHook().zoomOut(0.4);
    });
    expect(getHook().zoom).toBe(0.8);
    cleanup();
  });

  it('clamps zoom between minZoom and maxZoom', () => {
    const { getHook, cleanup } = setupHook({
      initialZoom: 1.0,
      minZoom: 0.5,
      maxZoom: 2.0,
    });

    act(() => {
      getHook().zoomIn(5.0);
    });
    expect(getHook().zoom).toBe(2.0);

    act(() => {
      getHook().zoomOut(10.0);
    });
    expect(getHook().zoom).toBe(0.5);
    cleanup();
  });

  it('resets view to 1.0 and pan {0, 0}', () => {
    const { getHook, cleanup } = setupHook({
      initialZoom: 1.5,
      initialPan: { x: 50, y: -30 },
    });

    act(() => {
      getHook().resetView();
    });
    expect(getHook().zoom).toBe(1.0);
    expect(getHook().pan).toEqual({ x: 0, y: 0 });
    cleanup();
  });

  it('handles fitToView', () => {
    const { getHook, cleanup } = setupHook();
    act(() => {
      getHook().fitToView(0.85);
    });
    expect(getHook().zoom).toBe(0.85);
    expect(getHook().pan).toEqual({ x: 0, y: 0 });
    cleanup();
  });

  it('handles mouse drag panning', () => {
    const { getHook, cleanup } = setupHook({
      initialPan: { x: 10, y: 10 },
    });

    // Start mouse down at (100, 100)
    act(() => {
      getHook().handleMouseDown({
        button: 0,
        clientX: 100,
        clientY: 100,
      } as any);
    });
    expect(getHook().isPanning).toBe(true);

    // Simulate mouse move to (150, 180) -> delta dx=50, dy=80
    act(() => {
      window.dispatchEvent(
        new MouseEvent('mousemove', {
          clientX: 150,
          clientY: 180,
        })
      );
    });
    expect(getHook().pan).toEqual({ x: 60, y: 90 });

    // Mouse up
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });
    expect(getHook().isPanning).toBe(false);
    cleanup();
  });

  it('calls onUpdate callback when zoom or pan changes', () => {
    const onUpdate = vi.fn();
    const { getHook, cleanup } = setupHook({ onUpdate });

    act(() => {
      getHook().zoomIn(0.2);
    });

    expect(onUpdate).toHaveBeenCalledWith({
      zoom: 1.2,
      pan: { x: 0, y: 0 },
    });
    cleanup();
  });
});
