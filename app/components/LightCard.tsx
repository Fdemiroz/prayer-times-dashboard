'use client';

/**
 * LightCard - Light control tile with circular brightness arc
 * Tap to toggle, three-dots for modal with brightness/color controls
 */

import { useState, useCallback } from 'react';
import type { HAEntityState, HALightAttributes, LightConfig } from '@/lib/types';
import { toggleLight, getBrightnessPercent } from '@/lib/homeassistant';
import LightModal from './LightModal';

interface LightCardProps {
  config: LightConfig;
  state: HAEntityState | null;
  onStateChanged: () => void;
}

// SVG arc path helper for circular brightness indicator
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(angleRad),
    y: cy + r * Math.sin(angleRad),
  };
}

// Light icon SVGs based on type
function LightIcon({ type, color }: { type: LightConfig['icon']; color: string }) {
  const style = { color };

  if (type === 'outdoor-lamp') {
    return (
      <svg className="w-10 h-10" style={style} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 2C8 2 6 5 6 8C6 10.21 7.79 12 10 12H14C16.21 12 18 10.21 18 8C18 5 16 2 16 2H8ZM12 10C10.9 10 10 9.1 10 8C10 6.9 12 4 12 4C12 4 14 6.9 14 8C14 9.1 13.1 10 12 10ZM11 13H13V15H11V13ZM10 16H14V18L16 20H8L10 18V16Z" />
      </svg>
    );
  }

  if (type === 'ceiling-light') {
    return (
      <svg className="w-10 h-10" style={style} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12,2L8,8H16L12,2M9,9V11.5L6.5,14L9,16.5V19H15V16.5L17.5,14L15,11.5V9H9M11,20V22H13V20H11Z" />
      </svg>
    );
  }

  if (type === 'lamp') {
    return (
      <svg className="w-10 h-10" style={style} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8,2H16L20,12H14V16H16V22H8V16H10V12H4L8,2M10,4L7.22,10H16.78L14,4H10Z" />
      </svg>
    );
  }

  // Default lightbulb
  return (
    <svg className="w-10 h-10" style={style} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12,2A7,7 0 0,0 5,9C5,11.38 6.19,13.47 8,14.74V17A1,1 0 0,0 9,18H15A1,1 0 0,0 16,17V14.74C17.81,13.47 19,11.38 19,9A7,7 0 0,0 12,2M9,21A1,1 0 0,0 10,22H14A1,1 0 0,0 15,21V20H9V21Z" />
    </svg>
  );
}

export default function LightCard({ config, state, onStateChanged }: LightCardProps) {
  const [showModal, setShowModal] = useState(false);

  const isOn = state?.state === 'on';
  const attributes = (state?.attributes || {}) as HALightAttributes;
  const brightness = isOn ? getBrightnessPercent(attributes) : 0;
  const rgbColor = attributes.rgb_color;

  // Determine the display color for the icon and arc
  const activeColor = rgbColor
    ? `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
    : '#fbbf24'; // Default gold/amber
  const iconColor = isOn ? activeColor : 'rgba(255,255,255,0.3)';

  const handleToggle = useCallback(async () => {
    try {
      await toggleLight(config.entityId);
      onStateChanged();
    } catch (err) {
      console.error('Failed to toggle light:', err);
    }
  }, [config.entityId, onStateChanged]);

  // Arc angles: start at 135 degrees, end at 405 (270 degree arc)
  const arcStart = 135;
  const arcEnd = 405;
  const arcRange = arcEnd - arcStart;
  const brightnessAngle = arcStart + (arcRange * brightness) / 100;

  return (
    <>
      <div className="light-card" onClick={handleToggle}>
        {/* Three dots menu */}
        <button
          className="light-card-menu"
          onClick={(e) => {
            e.stopPropagation();
            setShowModal(true);
          }}
          aria-label={`${config.name} instellingen`}
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>

        {/* Circular brightness arc */}
        <div className="light-card-icon-container">
          <svg viewBox="0 0 100 100" className="light-arc-svg">
            {/* Background arc (track) */}
            <path
              d={describeArc(50, 50, 42, arcStart, arcEnd)}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Active brightness arc */}
            {isOn && brightness > 0 && (
              <path
                d={describeArc(50, 50, 42, arcStart, brightnessAngle)}
                fill="none"
                stroke={activeColor}
                strokeWidth="5"
                strokeLinecap="round"
                style={{
                  filter: `drop-shadow(0 0 6px ${activeColor})`,
                  transition: 'all 0.3s ease',
                }}
              />
            )}
            {/* Brightness dot indicator */}
            {isOn && brightness > 0 && (
              <circle
                cx={polarToCartesian(50, 50, 42, brightnessAngle).x}
                cy={polarToCartesian(50, 50, 42, brightnessAngle).y}
                r="4"
                fill={activeColor}
                style={{
                  filter: `drop-shadow(0 0 4px ${activeColor})`,
                  transition: 'all 0.3s ease',
                }}
              />
            )}
          </svg>

          {/* Icon centered in arc */}
          <div className="light-card-icon">
            <LightIcon type={config.icon} color={iconColor} />
          </div>
        </div>

        {/* Label */}
        <span className={`light-card-name ${isOn ? 'light-card-name-on' : ''}`}>
          {config.name}
        </span>
      </div>

      {/* Modal */}
      {showModal && (
        <LightModal
          config={config}
          state={state}
          onClose={() => setShowModal(false)}
          onStateChanged={onStateChanged}
        />
      )}
    </>
  );
}
