/**
 * Prayer time utilities
 * Handles API fetching, Hijri date calculation, and prayer status logic
 */

import type { 
  PrayerTimes, 
  HijriDate, 
  PrayerStatus, 
  PrayerName, 
  AlAdhanResponse 
} from './types';
import { CALCULATION_METHOD } from './config';

// =============================================================================
// AL-ADHAN API
// =============================================================================

/**
 * Fetch prayer times from Al-Adhan API
 * @param latitude - Location latitude
 * @param longitude - Location longitude
 * @param date - Date to fetch times for (defaults to today)
 * @returns Prayer times object
 */
export async function fetchPrayerTimes(
  latitude: number,
  longitude: number,
  date: Date = new Date()
): Promise<{ prayerTimes: PrayerTimes; hijriDate: HijriDate }> {
  // Format date as DD-MM-YYYY for API
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const dateStr = `${day}-${month}-${year}`;

  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=${CALCULATION_METHOD}`;

  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: AlAdhanResponse = await response.json();

    // Extract prayer times (remove timezone suffix like "(CEST)")
    const timings = data.data.timings;
    const cleanTime = (time: string) => time.split(' ')[0].substring(0, 5);

    const prayerTimes: PrayerTimes = {
      fajr: cleanTime(timings.Fajr),
      sunrise: cleanTime(timings.Sunrise),
      dhuhr: cleanTime(timings.Dhuhr),
      asr: cleanTime(timings.Asr),
      maghrib: cleanTime(timings.Maghrib),
      isha: cleanTime(timings.Isha),
      fetchedAt: Date.now(),
      date: `${year}-${month}-${day}`,
    };

    // Extract Hijri date from API response
    const hijri = data.data.date.hijri;
    const hijriDate: HijriDate = {
      day: parseInt(hijri.day, 10),
      month: hijri.month.number,
      monthName: hijri.month.en,
      monthNameAr: hijri.month.ar,
      year: parseInt(hijri.year, 10),
    };

    return { prayerTimes, hijriDate };
  } catch (error) {
    console.error('Failed to fetch prayer times:', error);
    throw error;
  }
}

// =============================================================================
// PRAYER STATUS CALCULATION
// =============================================================================

// Prayer order for iteration
const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

/**
 * Convert "HH:MM" time string to minutes since midnight
 */
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Convert minutes since midnight to "HH:MM" format
 */
function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

/**
 * Determine current prayer and time until next prayer
 * Handles edge cases: after Isha (next is Fajr tomorrow), before Fajr (current is Isha)
 */
export function getPrayerStatus(
  prayerTimes: PrayerTimes,
  currentTime: Date
): PrayerStatus {
  const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const nowSeconds = currentTime.getSeconds();

  // Convert all prayer times to minutes
  const prayerMinutes: Record<PrayerName, number> = {
    fajr: timeToMinutes(prayerTimes.fajr),
    dhuhr: timeToMinutes(prayerTimes.dhuhr),
    asr: timeToMinutes(prayerTimes.asr),
    maghrib: timeToMinutes(prayerTimes.maghrib),
    isha: timeToMinutes(prayerTimes.isha),
  };

  let current: PrayerName = 'isha';
  let next: PrayerName = 'fajr';
  let timeUntilNext = 0;

  // Find current and next prayer
  // Edge case 1: Before Fajr - current is Isha (from yesterday), next is Fajr
  if (nowMinutes < prayerMinutes.fajr) {
    current = 'isha';
    next = 'fajr';
    timeUntilNext = prayerMinutes.fajr - nowMinutes;
  }
  // Edge case 2: After Isha - current is Isha, next is Fajr (tomorrow)
  else if (nowMinutes >= prayerMinutes.isha) {
    current = 'isha';
    next = 'fajr';
    // Time until midnight + time from midnight to Fajr
    timeUntilNext = (24 * 60 - nowMinutes) + prayerMinutes.fajr;
  }
  // Normal case: Find which prayer period we're in
  else {
    for (let i = 0; i < PRAYER_ORDER.length; i++) {
      const prayer = PRAYER_ORDER[i];
      const nextPrayer = PRAYER_ORDER[(i + 1) % PRAYER_ORDER.length];
      const prayerTime = prayerMinutes[prayer];
      const nextPrayerTime = prayerMinutes[nextPrayer];

      // Check if current time is after this prayer and before next
      if (nowMinutes >= prayerTime) {
        // Check if next prayer is later today or we've passed the last prayer
        if (i === PRAYER_ORDER.length - 1 || nowMinutes < nextPrayerTime) {
          current = prayer;
          next = nextPrayer;
          
          // Calculate time until next prayer
          if (nextPrayerTime > nowMinutes) {
            timeUntilNext = nextPrayerTime - nowMinutes;
          } else {
            // Next prayer is tomorrow (Fajr after Isha)
            timeUntilNext = (24 * 60 - nowMinutes) + nextPrayerTime;
          }
          break;
        }
      }
    }
  }

  // Calculate seconds component for more precise countdown
  const secondsUntilNext = (timeUntilNext * 60) - nowSeconds;

  return {
    current,
    next,
    timeUntilNext,
    secondsUntilNext: Math.max(0, secondsUntilNext),
  };
}

// =============================================================================
// COUNTDOWN FORMATTING
// =============================================================================

/**
 * Format seconds into HH:MM:SS countdown display
 */
export function formatCountdown(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Format time for display (12-hour or 24-hour)
 */
export function formatTime(date: Date, use24Hour: boolean = true): string {
  if (use24Hour) {
    return date.toLocaleTimeString('nl-NL', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  }
  
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
}

/**
 * Calculate iqama time based on prayer time and offset
 */
export function calculateIqamaTime(prayerTime: string, offsetMinutes: number): string {
  const minutes = timeToMinutes(prayerTime) + offsetMinutes;
  return minutesToTime(minutes);
}

// =============================================================================
// DATE FORMATTING
// =============================================================================

/**
 * Format Hijri date for display
 */
export function formatHijriDate(hijri: HijriDate, monthNames: string[]): string {
  const monthName = monthNames[hijri.month - 1] || hijri.monthName;
  return `${hijri.day} ${monthName} ${hijri.year}`;
}

/**
 * Format Gregorian date for display
 */
export function formatGregorianDate(date: Date, locale: string = 'nl-NL'): string {
  return date.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
