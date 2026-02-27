'use client';

/**
 * PrayerCard - Weather-forecast-style prayer times display
 * Shows current prayer + countdown at top, horizontal prayer row below
 */

import type { PrayerTimes, PrayerStatus, PrayerName, Language, Translations } from '@/lib/types';
import { formatCountdown } from '@/lib/prayerUtils';

interface PrayerCardProps {
  prayerTimes: PrayerTimes | null;
  prayerStatus: PrayerStatus | null;
  t: Translations;
  language: Language;
}

const PRAYER_ORDER: PrayerName[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

// Prayer-specific icons (mosque/moon themed)
function PrayerIcon({ prayer, isActive, isPast }: { prayer: PrayerName; isActive: boolean; isPast: boolean }) {
  const color = isActive ? '#34d399' : isPast ? 'rgba(251,191,36,0.5)' : 'rgba(251,191,36,0.8)';

  return (
    <div
      className="prayer-forecast-icon"
      style={{
        backgroundColor: color,
        opacity: isPast && !isActive ? 0.5 : 1,
        boxShadow: isActive ? `0 0 12px ${color}` : 'none',
      }}
    />
  );
}

export default function PrayerCard({ prayerTimes, prayerStatus, t }: PrayerCardProps) {
  if (!prayerTimes || !prayerStatus) {
    return (
      <div className="prayer-forecast-card">
        <div className="prayer-forecast-loading">
          <span className="text-gray-500 text-sm">{t.loading}</span>
        </div>
      </div>
    );
  }

  const currentPrayerName = t.prayers[prayerStatus.current] || prayerStatus.current;
  const nextPrayerName = t.prayers[prayerStatus.next] || prayerStatus.next;

  return (
    <div className="prayer-forecast-card">
      {/* Header row: current prayer + countdown */}
      <div className="prayer-forecast-header">
        <div className="prayer-forecast-header-left">
          <span className="prayer-forecast-current-icon">&#9770;</span>
          <div>
            <p className="prayer-forecast-current-name">{currentPrayerName}</p>
            <p className="prayer-forecast-subtitle">Gebedstijden</p>
          </div>
        </div>
        <div className="prayer-forecast-header-right">
          <p className="prayer-forecast-countdown">
            {formatCountdown(prayerStatus.secondsUntilNext)}
          </p>
          <p className="prayer-forecast-next-label">
            tot {nextPrayerName}
          </p>
        </div>
      </div>

      {/* Horizontal prayer times row (like weather hourly forecast) */}
      <div className="prayer-forecast-row">
        {PRAYER_ORDER.map((prayer) => {
          const time = prayerTimes[prayer];
          const isActive = prayerStatus.current === prayer;
          const isPast = (() => {
            const currentIdx = PRAYER_ORDER.indexOf(prayerStatus.current);
            const prayerIdx = PRAYER_ORDER.indexOf(prayer);
            return prayerIdx < currentIdx;
          })();

          return (
            <div
              key={prayer}
              className={`prayer-forecast-item ${isActive ? 'prayer-forecast-item-active' : ''} ${isPast ? 'prayer-forecast-item-past' : ''}`}
            >
              <span className="prayer-forecast-time">{time}</span>
              <PrayerIcon prayer={prayer} isActive={isActive} isPast={isPast} />
              <span className="prayer-forecast-name">{t.prayers[prayer]}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
