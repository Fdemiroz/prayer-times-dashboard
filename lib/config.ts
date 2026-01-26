/**
 * Configuration for the Prayer Dashboard
 * Edit this file to customize location, calculation method, and display options
 */

import type { LocationConfig, IqamaOffsets, Language, Translations } from './types';

// =============================================================================
// LOCATION CONFIGURATION
// =============================================================================
// Default location: Hengelo, Overijssel, Nederland
// The app will attempt to use device geolocation first, then fall back to this
export const DEFAULT_LOCATION: LocationConfig = {
  latitude: 52.2659,
  longitude: 6.7931,
  city: 'Hengelo',
  country: 'Nederland',
  timezone: 'Europe/Amsterdam',
};

// =============================================================================
// CALCULATION METHOD
// =============================================================================
// Al-Adhan API calculation methods:
// 0 = Shia Ithna-Ashari
// 1 = University of Islamic Sciences, Karachi
// 2 = Islamic Society of North America (ISNA)
// 3 = Muslim World League
// 4 = Umm Al-Qura University, Makkah
// 5 = Egyptian General Authority of Survey
// 7 = Institute of Geophysics, University of Tehran
// 8 = Gulf Region
// 9 = Kuwait
// 10 = Qatar
// 11 = Majlis Ugama Islam Singapura
// 12 = Union Organization Islamic de France
// 13 = Diyanet İşleri Başkanlığı, Turkey (RECOMMENDED FOR EUROPE)
// 14 = Spiritual Administration of Muslims of Russia
// 15 = Moonsighting Committee Worldwide
export const CALCULATION_METHOD = 13; // Diyanet - Turkish Religious Authority

// =============================================================================
// IQAMA OFFSETS (minutes after Adhan)
// =============================================================================
export const IQAMA_OFFSETS: IqamaOffsets = {
  fajr: 10,
  dhuhr: 5,
  asr: 5,
  maghrib: 5,
  isha: 10,
};

// =============================================================================
// DISPLAY SETTINGS
// =============================================================================
export const DEFAULT_LANGUAGE: Language = 'nl';

// Cache duration in milliseconds (24 hours)
export const CACHE_DURATION = 24 * 60 * 60 * 1000;

// Clock update interval in milliseconds
export const CLOCK_INTERVAL = 1000;

// =============================================================================
// TRANSLATIONS
// =============================================================================
export const TRANSLATIONS: Record<Language, Translations> = {
  // English
  en: {
    currentTime: 'Current Time',
    hijriDate: 'Hijri Date',
    gregorianDate: 'Date',
    currentPrayer: 'Current Prayer',
    nextPrayer: 'Next Prayer',
    countdown: 'Time Remaining',
    loading: 'Loading prayer times...',
    prayers: {
      fajr: 'Fajr',
      sunrise: 'Sunrise',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    },
    iqama: 'Iqama',
    months: [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
      'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
    ],
  },
  
  // Nederlands (Dutch)
  nl: {
    currentTime: 'Huidige Tijd',
    hijriDate: 'Hijri Datum',
    gregorianDate: 'Datum',
    currentPrayer: 'Huidig Gebed',
    nextPrayer: 'Volgend Gebed',
    countdown: 'Tijd tot',
    loading: 'Gebedstijden laden...',
    prayers: {
      fajr: 'Fajr',
      sunrise: 'Zonsopgang',
      dhuhr: 'Dhuhr',
      asr: 'Asr',
      maghrib: 'Maghrib',
      isha: 'Isha',
    },
    iqama: 'Iqama',
    months: [
      'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
      'Jumada al-Awwal', 'Jumada al-Thani', 'Rajab', 'Shaban',
      'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
    ],
  },
  
  // Türkçe (Turkish)
  tr: {
    currentTime: 'Şu Anki Saat',
    hijriDate: 'Hicri Tarih',
    gregorianDate: 'Tarih',
    currentPrayer: 'Şu Anki Namaz',
    nextPrayer: 'Sonraki Namaz',
    countdown: 'Kalan Süre',
    loading: 'Namaz vakitleri yükleniyor...',
    prayers: {
      fajr: 'Sabah',
      sunrise: 'Güneş',
      dhuhr: 'Öğle',
      asr: 'İkindi',
      maghrib: 'Akşam',
      isha: 'Yatsı',
    },
    iqama: 'İkamet',
    months: [
      'Muharrem', 'Safer', 'Rebiülevvel', 'Rebiülahir',
      'Cemaziyelevvel', 'Cemaziyelahir', 'Recep', 'Şaban',
      'Ramazan', 'Şevval', 'Zilkade', 'Zilhicce'
    ],
  },
};
