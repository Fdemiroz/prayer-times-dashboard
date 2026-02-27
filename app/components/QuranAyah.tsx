'use client';

/**
 * QuranAyah - Compact Quran ayah display for bottom bar
 * Shows Arabic text + translation in a single compact row
 */

import { useEffect, useState, useCallback } from 'react';
import type { QuranAyah, Language, PrayerName } from '@/lib/types';
import { fetchRandomAyah } from '@/lib/prayerUtils';

interface QuranAyahProps {
  language: Language;
  currentPrayer: PrayerName | null;
}

export default function QuranAyahDisplay({ language, currentPrayer }: QuranAyahProps) {
  const [ayah, setAyah] = useState<QuranAyah | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastPrayer, setLastPrayer] = useState<PrayerName | null>(null);

  // Surah labels by language
  const surahLabel: Record<Language, string> = {
    en: 'Surah',
    nl: 'Soera',
    tr: 'Sure',
  };

  const loadRandomAyah = useCallback(async () => {
    setIsLoading(true);
    try {
      const newAyah = await fetchRandomAyah();
      setAyah(newAyah);
    } catch (err) {
      console.error('Failed to load Quran ayah:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadRandomAyah();
  }, [loadRandomAyah]);

  // Refresh on prayer change
  useEffect(() => {
    if (currentPrayer && currentPrayer !== lastPrayer) {
      if (lastPrayer !== null) {
        loadRandomAyah();
      }
      setLastPrayer(currentPrayer);
    }
  }, [currentPrayer, lastPrayer, loadRandomAyah]);

  if (isLoading && !ayah) {
    return (
      <div className="quran-bar">
        <div className="quran-bar-loading">
          <span className="quran-bar-dot" />
          <span className="quran-bar-dot" />
          <span className="quran-bar-dot" />
        </div>
      </div>
    );
  }

  if (!ayah) return null;

  // Truncate long translations for compact display
  const translation = ayah.translations[language];
  const maxLen = 180;
  const truncated = translation.length > maxLen
    ? translation.substring(0, maxLen) + '...'
    : translation;

  return (
    <div className="quran-bar">
      <div className="quran-bar-content">
        {/* Arabic text */}
        <p className="quran-bar-arabic" dir="rtl">
          {ayah.arabic}
        </p>
        {/* Translation + reference */}
        <p className="quran-bar-translation">
          &ldquo;{truncated}&rdquo;
          <span className="quran-bar-ref">
            {' '}&mdash; {surahLabel[language]} {ayah.surahName} ({ayah.surahNumber}:{ayah.ayahInSurah})
          </span>
        </p>
      </div>
      {/* Refresh button */}
      <button
        className="quran-bar-refresh"
        onClick={() => loadRandomAyah()}
        disabled={isLoading}
        aria-label="Nieuwe ayah"
      >
        <svg
          className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 3v5h5" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M16 16h5v5" />
        </svg>
      </button>
    </div>
  );
}
