'use client';

/**
 * Home Dashboard - Main Page
 * Combines Home Assistant controls + Prayer Times + Quran Ayah
 * Optimized for Google Nest Hub (1024x600) via DashCast
 *
 * Layout (2-column grid, 1024x600):
 * +----------------------------+---------------+---------------+
 * |     Camera Feed            |  Achtertuin   |   Eetkamer    |
 * |  (parkeerplaats live)      |  (light+dim)  |  (light+dim)  |
 * +----------------------------+---------------+---------------+
 * |    Prayer Times Card       |  Woonkamer    |    Emine      |
 * |  (weather-forecast style)  |  (light+dim)  |  (vacuum)     |
 * +----------------------------+---------------+---------------+
 * |  Quran Ayah - Arabic text + translation (compact bar)      |
 * +------------------------------------------------------------+
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import type { PrayerTimes, HijriDate, PrayerStatus, PrayerName, Language } from '@/lib/types';
import type { HAEntityState, LightConfig } from '@/lib/types';
import {
  fetchPrayerTimes,
  getPrayerStatus,
} from '@/lib/prayerUtils';
import {
  getCachedPrayerData,
  setCachedPrayerData,
  shouldRefreshPrayerTimes,
  getCachedLanguage,
  setCachedLanguage,
} from '@/lib/storage';
import {
  DEFAULT_LOCATION,
  TRANSLATIONS,
  CLOCK_INTERVAL,
} from '@/lib/config';
import { fetchEntityStates } from '@/lib/homeassistant';

// Components
import CameraFeed from './components/CameraFeed';
import LightCard from './components/LightCard';
import VacuumCard from './components/VacuumCard';
import PrayerCard from './components/PrayerCard';
import QuranAyahDisplay from './components/QuranAyah';

// =============================================================================
// CONFIGURATION
// =============================================================================

// HA entity IDs
const CAMERA_ENTITY = 'camera.parkeerplaats_vloeiend';
const VACUUM_ENTITY = 'vacuum.emine';

// Light configs
const LIGHTS: LightConfig[] = [
  { entityId: 'light.achtertuin', name: 'Achtertuin', icon: 'outdoor-lamp' },
  { entityId: 'light.eetkamer', name: 'Eetkamer', icon: 'ceiling-light' },
  { entityId: 'light.woonkamer', name: 'Woonkamer', icon: 'lamp' },
];

// All HA entity IDs to poll
const ALL_ENTITY_IDS = [
  ...LIGHTS.map((l) => l.entityId),
  VACUUM_ENTITY,
];

// Polling intervals
const HA_POLL_INTERVAL = 5000; // 5s for HA entity states
const SELF_HEALING_INTERVAL = 5 * 60 * 1000; // 5 min

// =============================================================================
// LANGUAGE SELECTOR COMPONENT
// =============================================================================

interface LanguageSelectorProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const LANGUAGE_OPTIONS: { code: Language; label: string; flag: string }[] = [
  { code: 'nl', label: 'NL', flag: '🇳🇱' },
  { code: 'en', label: 'EN', flag: '🇬🇧' },
  { code: 'tr', label: 'TR', flag: '🇹🇷' },
];

function LanguageSelector({ currentLanguage, onLanguageChange, isOpen, onToggle }: LanguageSelectorProps) {
  return (
    <div className="absolute top-2 right-2 z-50">
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(); }}
        className="language-toggle"
        aria-label="Change language"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          className="w-3.5 h-3.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          <path d="M2 12h20" />
        </svg>
      </button>
      <div
        className={`language-menu ${isOpen ? 'language-menu-open' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {LANGUAGE_OPTIONS.map((option) => (
          <button
            key={option.code}
            onClick={() => { onLanguageChange(option.code); onToggle(); }}
            className={`language-option ${currentLanguage === option.code ? 'language-option-active' : ''}`}
          >
            <span>{option.flag}</span>
            <span>{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// =============================================================================
// MAIN DASHBOARD COMPONENT
// =============================================================================

export default function Dashboard() {
  // ---- Prayer state ----
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [, setHijriDate] = useState<HijriDate | null>(null);
  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<Language>('nl');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // ---- HA state ----
  const [entityStates, setEntityStates] = useState<Record<string, HAEntityState>>({});
  const pollTimerRef = useRef<NodeJS.Timeout | null>(null);

  // ---- Translations ----
  const t = TRANSLATIONS[language];

  // ---- Language ----
  useEffect(() => {
    setLanguage(getCachedLanguage());
  }, []);

  const handleLanguageChange = (newLang: Language) => {
    setLanguage(newLang);
    setCachedLanguage(newLang);
  };

  // ---- Clock ----
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), CLOCK_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  // ---- Prayer times fetching ----
  const loadPrayerTimes = useCallback(async (forceRefresh = false) => {
    const cached = getCachedPrayerData();

    if (!forceRefresh && cached && !shouldRefreshPrayerTimes(cached.prayerTimes)) {
      setPrayerTimes(cached.prayerTimes);
      setHijriDate(cached.hijriDate);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      let lat = DEFAULT_LOCATION.latitude;
      let lng = DEFAULT_LOCATION.longitude;

      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000, maximumAge: 86400000,
            });
          });
          lat = pos.coords.latitude;
          lng = pos.coords.longitude;
        } catch {
          // Use default
        }
      }

      const { prayerTimes: times, hijriDate: hijri } = await fetchPrayerTimes(lat, lng);
      setPrayerTimes(times);
      setHijriDate(hijri);
      setCachedPrayerData(times, hijri);
    } catch (err) {
      console.error('Failed to load prayer times:', err);
      const cached2 = getCachedPrayerData();
      if (cached2) {
        setPrayerTimes(cached2.prayerTimes);
        setHijriDate(cached2.hijriDate);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadPrayerTimes(); }, [loadPrayerTimes]);

  // Update prayer status every second
  useEffect(() => {
    if (prayerTimes) {
      setPrayerStatus(getPrayerStatus(prayerTimes, currentTime));
    }
  }, [currentTime, prayerTimes]);

  // Midnight refresh
  useEffect(() => {
    if (prayerTimes && shouldRefreshPrayerTimes(prayerTimes)) {
      loadPrayerTimes();
    }
  }, [currentTime, prayerTimes, loadPrayerTimes]);

  // Self-healing refresh
  useEffect(() => {
    const timer = setInterval(() => {
      if (!prayerTimes || shouldRefreshPrayerTimes(prayerTimes)) {
        loadPrayerTimes(true);
      }
    }, SELF_HEALING_INTERVAL);
    return () => clearInterval(timer);
  }, [prayerTimes, loadPrayerTimes]);

  // Visibility change
  useEffect(() => {
    const handler = () => {
      if (document.visibilityState === 'visible') {
        if (!prayerTimes || shouldRefreshPrayerTimes(prayerTimes)) {
          loadPrayerTimes(true);
        }
        pollEntityStates();
      }
    };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prayerTimes, loadPrayerTimes]);

  // Click-outside to close language menu
  useEffect(() => {
    const handler = () => { if (isLanguageMenuOpen) setIsLanguageMenuOpen(false); };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [isLanguageMenuOpen]);

  // ---- HA entity polling ----
  const pollEntityStates = useCallback(async () => {
    try {
      const states = await fetchEntityStates(ALL_ENTITY_IDS);
      setEntityStates(states);
    } catch (err) {
      console.error('Failed to poll HA entities:', err);
    }
  }, []);

  useEffect(() => {
    pollEntityStates();
    pollTimerRef.current = setInterval(pollEntityStates, HA_POLL_INTERVAL);
    return () => {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    };
  }, [pollEntityStates]);

  // Called when a component triggers a state change (toggle, brightness, etc.)
  const handleStateChanged = useCallback(() => {
    // Re-poll after a short delay to get updated state
    setTimeout(pollEntityStates, 500);
  }, [pollEntityStates]);

  // ---- Loading state ----
  if (isLoading && !prayerTimes) {
    return (
      <main className="h-screen w-screen animated-bg flex items-center justify-center">
        <div className="islamic-pattern" />
        <div className="text-center relative z-10">
          <div className="w-12 h-12 border-3 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-lg text-amber-200/70 loading-pulse">{t.loading}</p>
        </div>
      </main>
    );
  }

  // ---- Main render ----
  return (
    <main className="h-screen w-screen animated-bg overflow-hidden relative">
      {/* Background decorations */}
      <div className="islamic-pattern" />
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />

      {/* Language selector */}
      <LanguageSelector
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        isOpen={isLanguageMenuOpen}
        onToggle={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
      />

      {/* Dashboard grid */}
      <div className="dashboard-grid">
        {/* ROW 1 */}
        {/* Camera feed - spans 2 rows worth of left column */}
        <div className="dashboard-camera">
          <CameraFeed entityId={CAMERA_ENTITY} refreshInterval={10000} />
        </div>

        {/* Achtertuin light */}
        <div className="dashboard-cell">
          <LightCard
            config={LIGHTS[0]}
            state={entityStates[LIGHTS[0].entityId] || null}
            onStateChanged={handleStateChanged}
          />
        </div>

        {/* Eetkamer light */}
        <div className="dashboard-cell">
          <LightCard
            config={LIGHTS[1]}
            state={entityStates[LIGHTS[1].entityId] || null}
            onStateChanged={handleStateChanged}
          />
        </div>

        {/* ROW 2 */}
        {/* Prayer times card */}
        <div className="dashboard-prayer">
          <PrayerCard
            prayerTimes={prayerTimes}
            prayerStatus={prayerStatus}
            t={t}
            language={language}
          />
        </div>

        {/* Woonkamer light */}
        <div className="dashboard-cell">
          <LightCard
            config={LIGHTS[2]}
            state={entityStates[LIGHTS[2].entityId] || null}
            onStateChanged={handleStateChanged}
          />
        </div>

        {/* Vacuum */}
        <div className="dashboard-cell">
          <VacuumCard
            entityId={VACUUM_ENTITY}
            state={entityStates[VACUUM_ENTITY] || null}
            onStateChanged={handleStateChanged}
          />
        </div>

        {/* ROW 3 - Full-width Quran ayah bar */}
        <div className="dashboard-quran">
          <QuranAyahDisplay
            language={language}
            currentPrayer={prayerStatus?.current || null}
          />
        </div>
      </div>
    </main>
  );
}
