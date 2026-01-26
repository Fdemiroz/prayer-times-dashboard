'use client';

/**
 * Prayer Times Dashboard - Main Page
 * Optimized for Google Nest Hub (1024x600)
 * 
 * Features:
 * - Islamic aesthetic with geometric patterns and mosque silhouette
 * - Large clock display with gold accents
 * - Hijri date with crescent moon
 * - Daily prayer times including Sunrise
 * - Horizontal day timeline with prayer markers
 * - Countdown to next prayer
 * - Auto-refresh and self-healing UI
 * - Language selector
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import type { PrayerTimes, HijriDate, PrayerStatus, PrayerName, Language } from '@/lib/types';
import { 
  fetchPrayerTimes, 
  getPrayerStatus, 
  formatCountdown, 
  formatTime,
  formatHijriDate,
  formatGregorianDate,
  calculateIqamaTime,
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
  IQAMA_OFFSETS, 
  TRANSLATIONS, 
  CLOCK_INTERVAL,
} from '@/lib/config';

// Self-healing refresh interval (5 minutes)
const SELF_HEALING_INTERVAL = 5 * 60 * 1000;

// Extended prayer type including sunrise
type ExtendedPrayerName = PrayerName | 'sunrise';

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
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
];

function LanguageSelector({ currentLanguage, onLanguageChange, isOpen, onToggle }: LanguageSelectorProps) {
  const handleToggleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle();
  };

  return (
    <div className="absolute top-3 right-3 z-50">
      <button
        onClick={handleToggleClick}
        className="language-toggle"
        aria-label="Change language"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          className="w-4 h-4"
        >
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
            onClick={() => {
              onLanguageChange(option.code);
              onToggle();
            }}
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
// PRAYER TIMELINE COMPONENT
// =============================================================================

interface TimelineProps {
  prayerTimes: PrayerTimes;
  currentTime: Date;
  prayerStatus: PrayerStatus;
  t: { prayers: Record<string, string> };
}

function PrayerTimeline({ prayerTimes, currentTime, prayerStatus, t }: TimelineProps) {
  // All prayers including sunrise for timeline
  const timelineItems: { key: ExtendedPrayerName; time: string }[] = [
    { key: 'fajr', time: prayerTimes.fajr },
    { key: 'sunrise', time: prayerTimes.sunrise },
    { key: 'dhuhr', time: prayerTimes.dhuhr },
    { key: 'asr', time: prayerTimes.asr },
    { key: 'maghrib', time: prayerTimes.maghrib },
    { key: 'isha', time: prayerTimes.isha },
  ];

  // Calculate position of current time on timeline (0-100%)
  const timeToMinutes = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const fajrMinutes = timeToMinutes(prayerTimes.fajr);
  const ishaMinutes = timeToMinutes(prayerTimes.isha);
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  
  // Timeline spans from Fajr to Isha
  const totalSpan = ishaMinutes - fajrMinutes;
  const currentPosition = Math.max(0, Math.min(100, ((currentMinutes - fajrMinutes) / totalSpan) * 100));

  // Get marker position for each prayer
  const getMarkerPosition = (time: string): number => {
    const minutes = timeToMinutes(time);
    return ((minutes - fajrMinutes) / totalSpan) * 100;
  };

  // Determine marker state
  const getMarkerState = (prayer: ExtendedPrayerName, time: string): 'past' | 'active' | 'future' => {
    const minutes = timeToMinutes(time);
    const isSunrise = prayer === 'sunrise';
    if (!isSunrise && prayer === prayerStatus.current) return 'active';
    if (currentMinutes >= minutes) return 'past';
    return 'future';
  };

  return (
    <div className="prayer-timeline">
      <div className="timeline-track">
        {/* Progress bar */}
        <div 
          className="timeline-progress" 
          style={{ width: `${Math.max(0, currentPosition)}%` }} 
        />
        
        {/* Prayer markers */}
        {timelineItems.map(({ key, time }) => {
          const position = getMarkerPosition(time);
          const state = getMarkerState(key, time);
          
          return (
            <div
              key={key}
              className={`timeline-marker timeline-marker-${state}`}
              style={{ left: `${position}%` }}
            >
              <span className={`timeline-label ${state === 'active' ? 'timeline-label-active' : ''}`}>
                {t.prayers[key]}
              </span>
            </div>
          );
        })}

        {/* Current time indicator */}
        {currentPosition > 0 && currentPosition < 100 && (
          <div 
            className="timeline-now" 
            style={{ left: `${currentPosition}%` }} 
          />
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HELPER: Get locale for date formatting
// =============================================================================
function getLocaleForLanguage(language: Language): string {
  switch (language) {
    case 'tr': return 'tr-TR';
    case 'en': return 'en-US';
    case 'nl': 
    default: return 'nl-NL';
  }
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PrayerDashboard() {
  // State
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [prayerTimes, setPrayerTimes] = useState<PrayerTimes | null>(null);
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [prayerStatus, setPrayerStatus] = useState<PrayerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('nl');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);

  // Load saved language on mount
  useEffect(() => {
    const savedLanguage = getCachedLanguage();
    setLanguage(savedLanguage);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setCachedLanguage(newLanguage);
  };

  // Get translations
  const t = TRANSLATIONS[language];

  // Prayer list including sunrise
  const allPrayers: ExtendedPrayerName[] = useMemo(() => 
    ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'], 
  []);

  // ---------------------------------------------------------------------------
  // LOAD PRAYER TIMES
  // ---------------------------------------------------------------------------
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
      setError(null);

      let lat = DEFAULT_LOCATION.latitude;
      let lng = DEFAULT_LOCATION.longitude;

      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              timeout: 5000,
              maximumAge: 86400000,
            });
          });
          lat = position.coords.latitude;
          lng = position.coords.longitude;
        } catch {
          console.log('Geolocation unavailable, using default location');
        }
      }

      const { prayerTimes: times, hijriDate: hijri } = await fetchPrayerTimes(lat, lng);
      
      setPrayerTimes(times);
      setHijriDate(hijri);
      setCachedPrayerData(times, hijri);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('Failed to load prayer times:', err);
      setError('Failed to load prayer times');
      setIsLoading(false);
      
      if (cached) {
        setPrayerTimes(cached.prayerTimes);
        setHijriDate(cached.hijriDate);
      }
    }
  }, []);

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, CLOCK_INTERVAL);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (prayerTimes) {
      const status = getPrayerStatus(prayerTimes, currentTime);
      setPrayerStatus(status);
    }
  }, [currentTime, prayerTimes]);

  useEffect(() => {
    if (!prayerTimes) return;
    if (shouldRefreshPrayerTimes(prayerTimes)) {
      console.log('Midnight crossed, refreshing prayer times...');
      loadPrayerTimes();
    }
  }, [currentTime, prayerTimes, loadPrayerTimes]);

  useEffect(() => {
    const healingTimer = setInterval(() => {
      if (!prayerTimes || shouldRefreshPrayerTimes(prayerTimes)) {
        console.log('Self-healing: refreshing prayer times...');
        loadPrayerTimes(true);
      }
    }, SELF_HEALING_INTERVAL);
    return () => clearInterval(healingTimer);
  }, [prayerTimes, loadPrayerTimes]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (!prayerTimes || shouldRefreshPrayerTimes(prayerTimes)) {
          loadPrayerTimes(true);
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [prayerTimes, loadPrayerTimes]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (isLanguageMenuOpen) setIsLanguageMenuOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isLanguageMenuOpen]);

  // ---------------------------------------------------------------------------
  // RENDER HELPERS
  // ---------------------------------------------------------------------------

  const getPrayerDisplayName = (prayer: ExtendedPrayerName): string => {
    return t.prayers[prayer] || prayer;
  };

  const getIqamaTime = (prayer: PrayerName): string => {
    const time = prayerTimes?.[prayer];
    if (!time || time === '--:--') return '--:--';
    return calculateIqamaTime(time, IQAMA_OFFSETS[prayer]);
  };

  const isPrayerPast = (prayer: ExtendedPrayerName, index: number): boolean => {
    if (!prayerStatus) return false;
    const currentIndex = allPrayers.indexOf(prayerStatus.current);
    // Handle sunrise specially - it's "past" after sunrise time
    if (prayer === 'sunrise' && prayerTimes) {
      const [h, m] = prayerTimes.sunrise.split(':').map(Number);
      const sunriseMinutes = h * 60 + m;
      const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
      return nowMinutes >= sunriseMinutes;
    }
    return index < currentIndex;
  };

  // ---------------------------------------------------------------------------
  // LOADING STATE
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <main className="h-screen w-screen animated-bg flex items-center justify-center">
        <div className="islamic-pattern" />
        <div className="text-center relative z-10">
          <div className="w-14 h-14 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-xl text-amber-200/70 loading-pulse">{t.loading}</p>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // ERROR STATE
  // ---------------------------------------------------------------------------
  if (error && !prayerTimes) {
    return (
      <main className="h-screen w-screen animated-bg flex items-center justify-center">
        <div className="islamic-pattern" />
        <div className="text-center relative z-10">
          <p className="text-xl text-red-400 mb-4">⚠️ {error}</p>
          <button 
            onClick={() => loadPrayerTimes(true)}
            className="px-5 py-2 bg-amber-600 rounded-lg hover:bg-amber-500 transition-colors cursor-pointer text-sm"
          >
            Retry
          </button>
        </div>
      </main>
    );
  }

  // ---------------------------------------------------------------------------
  // MAIN RENDER
  // ---------------------------------------------------------------------------
  return (
    <main className="h-screen w-screen animated-bg overflow-hidden relative">
      {/* Islamic Background Elements */}
      <div className="islamic-pattern" />
      <div className="glow-orb glow-orb-1" />
      <div className="glow-orb glow-orb-2" />
      <div className="glow-orb glow-orb-3" />
      <div className="mosque-silhouette" />

      {/* Language Selector */}
      <LanguageSelector
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        isOpen={isLanguageMenuOpen}
        onToggle={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
      />

      {/* Main content */}
      <div className="relative h-full w-full p-4 flex flex-col z-10">
        
        {/* TOP ROW: Clock + Date + Current Prayer + Countdown */}
        <div className="grid grid-cols-4 gap-3 mb-2">
          
          {/* Current Time */}
          <div className="info-card flex flex-col justify-center items-center py-3">
            <p className="text-amber-200/50 text-xs mb-1 text-display uppercase tracking-wider">{t.currentTime}</p>
            <p className="clock-display">
              {formatTime(currentTime)}
            </p>
          </div>

          {/* Hijri & Gregorian Date */}
          <div className="info-card flex flex-col justify-center items-center py-3">
            <p className="text-amber-200/50 text-xs mb-1 text-display uppercase tracking-wider">{t.hijriDate}</p>
            {hijriDate && (
              <p className="text-xl font-bold text-white text-arabic flex items-center">
                <span className="crescent-moon">☪</span>
                {formatHijriDate(hijriDate, t.months)}
              </p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              {formatGregorianDate(currentTime, getLocaleForLanguage(language))}
            </p>
          </div>

          {/* Current Prayer */}
          <div className="info-card info-card-accent flex flex-col justify-center items-center py-3">
            <p className="text-emerald-200/60 text-xs mb-1 text-display uppercase tracking-wider">{t.currentPrayer}</p>
            {prayerStatus && (
              <>
                <p className="text-2xl font-bold text-emerald-400 text-display">
                  {getPrayerDisplayName(prayerStatus.current)}
                </p>
                {prayerTimes && (
                  <p className="text-sm text-gray-400 mt-0.5 text-time">
                    {prayerTimes[prayerStatus.current]}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Countdown to Next Prayer */}
          <div className="info-card info-card-countdown flex flex-col justify-center items-center py-3">
            <p className="text-amber-200/60 text-xs mb-1 text-display uppercase tracking-wider">
              {t.countdown} {prayerStatus && getPrayerDisplayName(prayerStatus.next)}
            </p>
            {prayerStatus && (
              <p className="countdown-display countdown-pulse">
                {formatCountdown(prayerStatus.secondsUntilNext)}
              </p>
            )}
            {prayerStatus && prayerTimes && (
              <p className="text-xs text-gray-400 mt-0.5 text-time">
                {prayerTimes[prayerStatus.next]}
              </p>
            )}
          </div>
        </div>

        {/* TIMELINE */}
        {prayerTimes && prayerStatus && (
          <PrayerTimeline 
            prayerTimes={prayerTimes} 
            currentTime={currentTime}
            prayerStatus={prayerStatus}
            t={t}
          />
        )}

        {/* PRAYER TIMES GRID - 6 columns including Sunrise */}
        <div className="grid grid-cols-6 gap-2 flex-1 mt-1">
          {allPrayers.map((prayer, index) => {
            const isSunrise = prayer === 'sunrise';
            const isActive = !isSunrise && prayerStatus?.current === prayer;
            const isPast = isPrayerPast(prayer, index);
            const time = prayerTimes?.[prayer] || '--:--';
            
            // Sunrise doesn't have iqama
            const iqamaTime = !isSunrise 
              ? getIqamaTime(prayer as PrayerName) 
              : null;

            return (
              <div
                key={prayer}
                className={`prayer-card 
                  ${isActive ? 'prayer-card-active' : ''} 
                  ${isPast ? 'prayer-card-past' : ''}
                  ${isSunrise ? 'prayer-card-sunrise' : ''}
                  flex flex-col items-center justify-center relative`}
              >
                {/* Prayer Name */}
                <p className={`prayer-name text-xs mb-1.5 text-display font-semibold uppercase tracking-wide
                  ${isActive ? 'text-emerald-300' : isSunrise ? 'text-amber-300/70' : isPast ? 'text-gray-600' : 'text-gray-400'}`}>
                  {getPrayerDisplayName(prayer)}
                </p>
                
                {/* Prayer Time */}
                <p className={`prayer-time text-2xl font-bold text-time
                  ${isActive ? 'text-white' : isSunrise ? 'text-amber-200/80' : isPast ? 'text-gray-600' : 'text-gray-200'}`}>
                  {time}
                </p>
                
                {/* Iqama Time (not for sunrise) */}
                {iqamaTime && (
                  <div className={`iqama-badge ${isActive ? 'iqama-badge-active' : ''}`}>
                    <span className="text-[0.6rem] uppercase tracking-wider opacity-60">{t.iqama}</span>
                    <span className="text-xs font-semibold text-time">{iqamaTime}</span>
                  </div>
                )}
                
                {/* Sunrise icon */}
                {isSunrise && (
                  <div className="mt-1 text-amber-400/60 text-lg">☀</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Location indicator */}
        <div className="absolute bottom-2 left-4">
          <div className="location-badge">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{DEFAULT_LOCATION.city}, {DEFAULT_LOCATION.country}</span>
          </div>
        </div>
      </div>
    </main>
  );
}
