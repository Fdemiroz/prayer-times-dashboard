/**
 * LocalStorage utilities for caching prayer times
 * Handles persistence and cache validation
 */

import type { PrayerTimes, HijriDate, Language } from './types';
import { CACHE_DURATION, DEFAULT_LANGUAGE } from './config';

// Storage keys
const STORAGE_KEYS = {
  PRAYER_TIMES: 'prayer_dashboard_times',
  HIJRI_DATE: 'prayer_dashboard_hijri',
  LOCATION: 'prayer_dashboard_location',
  LANGUAGE: 'prayer_dashboard_language',
} as const;

// Cached data structure
interface CachedData {
  prayerTimes: PrayerTimes;
  hijriDate: HijriDate;
}

/**
 * Check if code is running in browser
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

/**
 * Get cached prayer times from localStorage
 * Returns null if cache is expired or doesn't exist
 */
export function getCachedPrayerData(): CachedData | null {
  if (!isBrowser()) return null;

  try {
    const timesJson = localStorage.getItem(STORAGE_KEYS.PRAYER_TIMES);
    const hijriJson = localStorage.getItem(STORAGE_KEYS.HIJRI_DATE);

    if (!timesJson || !hijriJson) return null;

    const prayerTimes: PrayerTimes = JSON.parse(timesJson);
    const hijriDate: HijriDate = JSON.parse(hijriJson);

    // Check if cache is still valid
    const cacheAge = Date.now() - prayerTimes.fetchedAt;
    if (cacheAge > CACHE_DURATION) {
      console.log('Prayer times cache expired, clearing...');
      clearCache();
      return null;
    }

    // Check if cached date matches today
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    if (prayerTimes.date !== todayStr) {
      console.log('Prayer times cache is for different date, clearing...');
      clearCache();
      return null;
    }

    console.log('Using cached prayer times');
    return { prayerTimes, hijriDate };
  } catch (error) {
    console.error('Error reading from cache:', error);
    clearCache();
    return null;
  }
}

/**
 * Save prayer times to localStorage
 */
export function setCachedPrayerData(prayerTimes: PrayerTimes, hijriDate: HijriDate): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.PRAYER_TIMES, JSON.stringify(prayerTimes));
    localStorage.setItem(STORAGE_KEYS.HIJRI_DATE, JSON.stringify(hijriDate));
    console.log('Prayer times cached successfully');
  } catch (error) {
    console.error('Error writing to cache:', error);
  }
}

/**
 * Clear all cached data
 */
export function clearCache(): void {
  if (!isBrowser()) return;

  try {
    localStorage.removeItem(STORAGE_KEYS.PRAYER_TIMES);
    localStorage.removeItem(STORAGE_KEYS.HIJRI_DATE);
    localStorage.removeItem(STORAGE_KEYS.LOCATION);
    console.log('Cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Save user's location preference
 */
export function setCachedLocation(latitude: number, longitude: number): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify({ latitude, longitude }));
  } catch (error) {
    console.error('Error saving location:', error);
  }
}

/**
 * Get cached location
 */
export function getCachedLocation(): { latitude: number; longitude: number } | null {
  if (!isBrowser()) return null;

  try {
    const locationJson = localStorage.getItem(STORAGE_KEYS.LOCATION);
    if (!locationJson) return null;
    return JSON.parse(locationJson);
  } catch (error) {
    console.error('Error reading location:', error);
    return null;
  }
}

/**
 * Check if we need to refresh prayer times (past midnight)
 */
export function shouldRefreshPrayerTimes(prayerTimes: PrayerTimes | null): boolean {
  if (!prayerTimes) return true;

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  return prayerTimes.date !== todayStr;
}

// =============================================================================
// LANGUAGE PERSISTENCE
// =============================================================================

/**
 * Get saved language preference from localStorage
 */
export function getCachedLanguage(): Language {
  if (!isBrowser()) return DEFAULT_LANGUAGE;

  try {
    const language = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    if (language && ['en', 'nl', 'tr'].includes(language)) {
      return language as Language;
    }
    return DEFAULT_LANGUAGE;
  } catch (error) {
    console.error('Error reading language:', error);
    return DEFAULT_LANGUAGE;
  }
}

/**
 * Save language preference to localStorage
 */
export function setCachedLanguage(language: Language): void {
  if (!isBrowser()) return;

  try {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
    console.log('Language saved:', language);
  } catch (error) {
    console.error('Error saving language:', error);
  }
}
