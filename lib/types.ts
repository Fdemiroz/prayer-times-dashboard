/**
 * TypeScript interfaces for the Prayer Dashboard
 */

// Prayer times returned from Al-Adhan API
export interface PrayerTimes {
  fajr: string;      // Format: "HH:MM"
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  fetchedAt: number; // Unix timestamp when fetched
  date: string;      // Date string "YYYY-MM-DD"
}

// Hijri date structure
export interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  monthNameAr: string;
  year: number;
}

// Prayer name type
export type PrayerName = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

// Current prayer status
export interface PrayerStatus {
  current: PrayerName;
  next: PrayerName;
  timeUntilNext: number;  // Minutes until next prayer
  secondsUntilNext: number; // Seconds component for countdown
}

// Location configuration
export interface LocationConfig {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
  timezone: string;
}

// Iqama offset configuration (minutes after adhan)
export interface IqamaOffsets {
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
}

// Supported languages
export type Language = 'en' | 'nl' | 'tr';

// Translation strings
export interface Translations {
  currentTime: string;
  hijriDate: string;
  gregorianDate: string;
  currentPrayer: string;
  nextPrayer: string;
  countdown: string;
  loading: string;
  prayers: {
    fajr: string;
    sunrise: string;
    dhuhr: string;
    asr: string;
    maghrib: string;
    isha: string;
  };
  iqama: string;
  months: string[];
}

// Al-Adhan API response structure
export interface AlAdhanResponse {
  code: number;
  status: string;
  data: {
    timings: {
      Fajr: string;
      Sunrise: string;
      Dhuhr: string;
      Asr: string;
      Sunset: string;
      Maghrib: string;
      Isha: string;
      Imsak: string;
      Midnight: string;
    };
    date: {
      readable: string;
      timestamp: string;
      hijri: {
        date: string;
        day: string;
        month: {
          number: number;
          en: string;
          ar: string;
        };
        year: string;
      };
      gregorian: {
        date: string;
        day: string;
        month: {
          number: number;
          en: string;
        };
        year: string;
      };
    };
    meta: {
      latitude: number;
      longitude: number;
      timezone: string;
      method: {
        id: number;
        name: string;
      };
    };
  };
}
