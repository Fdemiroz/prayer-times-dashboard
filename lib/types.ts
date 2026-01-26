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

// Quran Ayah structure with all translations cached
export interface QuranAyah {
  number: number;           // Global ayah number (1-6236)
  arabic: string;           // Arabic text
  translations: {           // All translations cached
    en: string;             // English (Sahih International)
    nl: string;             // Dutch (Sofyan S. Siregar)
    tr: string;             // Turkish (Diyanet Isleri)
  };
  surahName: string;        // Surah name in English
  surahNameAr: string;      // Surah name in Arabic
  surahNumber: number;      // Surah number (1-114)
  ayahInSurah: number;      // Ayah number within surah
}

// Al-Quran Cloud API response structure
export interface AlQuranCloudResponse {
  code: number;
  status: string;
  data: Array<{
    number: number;
    text: string;
    surah: {
      number: number;
      name: string;
      englishName: string;
      englishNameTranslation: string;
      numberOfAyahs: number;
    };
    numberInSurah: number;
    edition: {
      identifier: string;
      language: string;
      name: string;
      englishName: string;
    };
  }>;
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
