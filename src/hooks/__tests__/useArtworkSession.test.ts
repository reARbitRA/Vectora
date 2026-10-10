// @vitest-environment jsdom
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import React, { act } from 'react';
import { createRoot } from 'react-dom/client';
import {
  useArtworkSession,
  LAST_ACTIVE_SESSION_KEY,
  loadLastActiveSession,
  saveLastActiveSession,
} from '../useArtworkSession';
import type { VectorArtwork } from '../../types';

const MOCK_ARTWORK_A: VectorArtwork = {
  id: 'artwork-a',
  title: 'Chrono Horizon',
  concept: 'Swiss Chronometer Dial',
  style: 'Brutalist Swiss',
  viewBox: '0 0 100 100',
  palette: [{ name: 'Ink', hex: '#000000', role: 'ink' }],
  layers: [{ name: 'Dial', description: 'Main dial' }],
  svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="40"/></svg>',
  evolutionIdeas: ['Add tachymeter scale'],
};

const MOCK_ARTWORK_B: VectorArtwork = {
  id: 'artwork-b',
  title: 'Cyber Grid',
  concept: 'Cybernetic Matrix',
  style: 'Cyberpunk',
  viewBox: '0 0 100 100',
  palette: [{ name: 'Neon', hex: '#FF003C', role: 'accent' }],
  layers: [{ name: 'Grid', description: 'Hex grid' }],
  svg: '<svg viewBox="0 0 100 100"><rect width="100" height="100"/></svg>',
  evolutionIdeas: ['Add glitch offset'],
};

describe('useArtworkSession hook and localStorage persistence', () => {
  let container: HTMLDivElement | null = null;
  let root: any = null;

  beforeEach(() => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    if (root) {
      act(() => {
        root.unmount();
      });
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container);
    }
    localStorage.clear();
  });

  it('restores artwork from localStorage on app load if last_active_session exists', async () => {
    localStorage.setItem(LAST_ACTIVE_SESSION_KEY, JSON.stringify(MOCK_ARTWORK_B));

    let hookResult: any = null;
    function TestComponent() {
      hookResult = useArtworkSession(MOCK_ARTWORK_A);
      return React.createElement('div', null, hookResult[0].title);
    }

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult[0]).toEqual(MOCK_ARTWORK_B);
    expect(hookResult[0].id).toBe('artwork-b');
  });

  it('falls back to initial fallbackArtwork when localStorage is empty', async () => {
    let hookResult: any = null;
    function TestComponent() {
      hookResult = useArtworkSession(MOCK_ARTWORK_A);
      return React.createElement('div', null, hookResult[0].title);
    }

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult[0]).toEqual(MOCK_ARTWORK_A);
    expect(localStorage.getItem(LAST_ACTIVE_SESSION_KEY)).toContain('artwork-a');
  });

  it('automatically persists to last_active_session whenever currentArtwork changes', async () => {
    let hookResult: any = null;
    function TestComponent() {
      hookResult = useArtworkSession(MOCK_ARTWORK_A);
      return React.createElement('div', null, hookResult[0].title);
    }

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult[0].id).toBe('artwork-a');

    await act(async () => {
      hookResult[1](MOCK_ARTWORK_B);
    });

    expect(hookResult[0].id).toBe('artwork-b');
    const stored = JSON.parse(localStorage.getItem(LAST_ACTIVE_SESSION_KEY) || '{}');
    expect(stored.id).toBe('artwork-b');
    expect(stored.title).toBe('Cyber Grid');
  });

  it('persists modified SVG contents of currentArtwork', async () => {
    let hookResult: any = null;
    function TestComponent() {
      hookResult = useArtworkSession(MOCK_ARTWORK_A);
      return React.createElement('div', null, hookResult[0].title);
    }

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    const modifiedArtwork = {
      ...MOCK_ARTWORK_A,
      svg: '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="yellow"/></svg>',
    };

    await act(async () => {
      hookResult[1](modifiedArtwork);
    });

    const loaded = loadLastActiveSession();
    expect(loaded?.svg).toContain('fill="yellow"');
    expect(loaded?.id).toBe('artwork-a');
  });

  it('handles corrupted localStorage gracefully without crashing', async () => {
    localStorage.setItem(LAST_ACTIVE_SESSION_KEY, '{invalid json');

    let hookResult: any = null;
    function TestComponent() {
      hookResult = useArtworkSession(MOCK_ARTWORK_A);
      return React.createElement('div', null, hookResult[0].title);
    }

    await act(async () => {
      root.render(React.createElement(TestComponent));
    });

    expect(hookResult[0]).toEqual(MOCK_ARTWORK_A);
  });
});
