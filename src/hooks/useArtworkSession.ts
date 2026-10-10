import { useState, useEffect, useRef } from 'react';
import type { VectorArtwork } from '../types';

export const LAST_ACTIVE_SESSION_KEY = 'last_active_session';

/**
 * Validates whether an object is a plausible VectorArtwork
 */
export function isValidArtwork(obj: any): obj is VectorArtwork {
  return (
    Boolean(obj) &&
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.title === 'string' &&
    typeof obj.svg === 'string'
  );
}

/**
 * Loads the last active artwork session from localStorage.
 * Returns null if not found or invalid.
 */
export function loadLastActiveSession(): VectorArtwork | null {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(LAST_ACTIVE_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidArtwork(parsed)) {
      return parsed;
    }
  } catch (err) {
    console.warn('[useArtworkSession] Failed to parse last_active_session from localStorage:', err);
  }
  return null;
}

/**
 * Persists the given artwork into localStorage under 'last_active_session'.
 */
export function saveLastActiveSession(artwork: VectorArtwork | null): void {
  if (typeof window === 'undefined' || !window.localStorage) {
    return;
  }
  try {
    if (artwork && isValidArtwork(artwork)) {
      window.localStorage.setItem(LAST_ACTIVE_SESSION_KEY, JSON.stringify(artwork));
    } else if (artwork === null) {
      window.localStorage.removeItem(LAST_ACTIVE_SESSION_KEY);
    }
  } catch (err) {
    console.warn('[useArtworkSession] Failed to persist last_active_session to localStorage:', err);
  }
}

/**
 * Hook that manages currentArtwork state with automatic persistence to 'last_active_session'
 * in localStorage whenever it changes, and restores it on initial app load.
 *
 * @param fallbackArtwork Artwork used if no valid last_active_session exists in localStorage.
 */
export function useArtworkSession(fallbackArtwork: VectorArtwork | (() => VectorArtwork)) {
  const [currentArtwork, setCurrentArtwork] = useState<VectorArtwork>(() => {
    const restored = loadLastActiveSession();
    if (restored) {
      return restored;
    }
    return typeof fallbackArtwork === 'function' ? fallbackArtwork() : fallbackArtwork;
  });

  const isFirstRender = useRef(true);

  // Automatically persist currentArtwork to 'last_active_session' whenever it changes
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      // Also ensure the current value is recorded in localStorage if not already present
      if (currentArtwork && isValidArtwork(currentArtwork)) {
        saveLastActiveSession(currentArtwork);
      }
      return;
    }

    saveLastActiveSession(currentArtwork);
  }, [currentArtwork]);

  return [currentArtwork, setCurrentArtwork] as const;
}
