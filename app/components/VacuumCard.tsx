'use client';

/**
 * VacuumCard - Robot vacuum control tile with status and circular arc
 * Shows docked/cleaning state, tap for start/dock toggle
 */

import { useCallback } from 'react';
import type { HAEntityState, HAVacuumAttributes } from '@/lib/types';
import { startVacuum, dockVacuum, getVacuumStatusLabel } from '@/lib/homeassistant';

interface VacuumCardProps {
  entityId: string;
  state: HAEntityState | null;
  onStateChanged: () => void;
}

export default function VacuumCard({ entityId, state, onStateChanged }: VacuumCardProps) {
  const vacuumState = state?.state || 'unavailable';
  const attributes = (state?.attributes || {}) as HAVacuumAttributes;
  const statusLabel = getVacuumStatusLabel(vacuumState);
  const isActive = vacuumState === 'cleaning' || vacuumState === 'returning';

  const handleToggle = useCallback(async () => {
    try {
      if (isActive) {
        await dockVacuum(entityId);
      } else {
        await startVacuum(entityId);
      }
      onStateChanged();
    } catch (err) {
      console.error('Failed to control vacuum:', err);
    }
  }, [entityId, isActive, onStateChanged]);

  // Arc progress for battery or active state
  const arcProgress = isActive ? 75 : vacuumState === 'docked' ? 100 : 0;

  // SVG arc helpers
  const arcStart = 135;
  const arcEnd = 405;
  const arcRange = arcEnd - arcStart;
  const progressAngle = arcStart + (arcRange * arcProgress) / 100;

  function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
    const angleRad = ((angleDeg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
  }

  function describeArc(cx: number, cy: number, r: number, start: number, end: number): string {
    const s = polarToCartesian(cx, cy, r, end);
    const e = polarToCartesian(cx, cy, r, start);
    const largeArc = end - start <= 180 ? '0' : '1';
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 0 ${e.x} ${e.y}`;
  }

  const arcColor = isActive ? '#34d399' : 'rgba(255,255,255,0.15)';

  return (
    <div className="vacuum-card" onClick={handleToggle}>
      {/* Three dots menu */}
      <button
        className="light-card-menu"
        onClick={(e) => e.stopPropagation()}
        aria-label="Emine instellingen"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" />
          <circle cx="12" cy="12" r="2" />
          <circle cx="12" cy="19" r="2" />
        </svg>
      </button>

      {/* Circular arc indicator */}
      <div className="light-card-icon-container">
        <svg viewBox="0 0 100 100" className="light-arc-svg">
          {/* Background arc */}
          <path
            d={describeArc(50, 50, 42, arcStart, arcEnd)}
            fill="none"
            stroke="rgba(255,255,255,0.08)"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Progress arc */}
          {arcProgress > 0 && (
            <path
              d={describeArc(50, 50, 42, arcStart, progressAngle)}
              fill="none"
              stroke={arcColor}
              strokeWidth="5"
              strokeLinecap="round"
              style={{ transition: 'all 0.5s ease' }}
            />
          )}
        </svg>

        {/* Vacuum icon */}
        <div className="light-card-icon">
          <svg
            className="w-8 h-8"
            fill="currentColor"
            viewBox="0 0 24 24"
            style={{ color: isActive ? '#34d399' : 'rgba(255,255,255,0.4)' }}
          >
            <path d="M12,2C17.52,2 22,6.48 22,12C22,17.52 17.52,22 12,22C6.48,22 2,17.52 2,12C2,6.48 6.48,2 12,2M12,4C7.58,4 4,7.58 4,12C4,16.42 7.58,20 12,20C16.42,20 20,16.42 20,12C20,7.58 16.42,4 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6M12,8A4,4 0 0,0 8,12A4,4 0 0,0 12,16A4,4 0 0,0 16,12A4,4 0 0,0 12,8Z" />
          </svg>
        </div>
      </div>

      {/* Name and status */}
      <span className="light-card-name light-card-name-on">
        {attributes.friendly_name || 'Emine'}
      </span>
      <span className="vacuum-status">{statusLabel}</span>
    </div>
  );
}
