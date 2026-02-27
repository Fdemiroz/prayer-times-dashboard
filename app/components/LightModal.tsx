'use client';

/**
 * LightModal - Full-screen modal with brightness slider and color presets
 * Matches the HA native light modal design (vertical brightness slider + color circles)
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import type { HAEntityState, HALightAttributes, LightConfig } from '@/lib/types';
import { turnOnLight, turnOffLight, getBrightnessPercent } from '@/lib/homeassistant';

interface LightModalProps {
  config: LightConfig;
  state: HAEntityState | null;
  onClose: () => void;
  onStateChanged: () => void;
}

// Color presets matching the HA screenshot (2 rows of 4)
const COLOR_PRESETS: { name: string; rgb: [number, number, number] }[] = [
  { name: 'Oranje', rgb: [255, 150, 50] },
  { name: 'Perzik', rgb: [255, 180, 120] },
  { name: 'Warm wit', rgb: [255, 210, 170] },
  { name: 'Koel wit', rgb: [240, 240, 240] },
  { name: 'Blauw', rgb: [100, 140, 255] },
  { name: 'Paars', rgb: [180, 100, 220] },
  { name: 'Roze', rgb: [240, 120, 200] },
  { name: 'Koraal', rgb: [255, 110, 110] },
];

export default function LightModal({ config, state, onClose, onStateChanged }: LightModalProps) {
  const isOn = state?.state === 'on';
  const attributes = (state?.attributes || {}) as HALightAttributes;
  const currentBrightness = isOn ? getBrightnessPercent(attributes) : 0;
  const rgbColor = attributes.rgb_color;

  const [brightness, setBrightness] = useState(currentBrightness);
  const [isDragging, setIsDragging] = useState(false);
  const sliderRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Sync brightness with external state changes
  useEffect(() => {
    if (!isDragging) {
      setBrightness(currentBrightness);
    }
  }, [currentBrightness, isDragging]);

  // Active color for the slider fill
  const activeColor = rgbColor
    ? `rgb(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]})`
    : '#fbbf24';

  const dimColor = rgbColor
    ? `rgba(${rgbColor[0]}, ${rgbColor[1]}, ${rgbColor[2]}, 0.3)`
    : 'rgba(251, 191, 36, 0.3)';

  // Debounced brightness update to HA
  const updateBrightness = useCallback(
    (pct: number) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        try {
          if (pct === 0) {
            await turnOffLight(config.entityId);
          } else {
            await turnOnLight(config.entityId, { brightness_pct: pct });
          }
          onStateChanged();
        } catch (err) {
          console.error('Failed to update brightness:', err);
        }
      }, 150);
    },
    [config.entityId, onStateChanged]
  );

  // Handle slider touch/click interaction
  const handleSliderInteraction = useCallback(
    (clientY: number) => {
      if (!sliderRef.current) return;
      const rect = sliderRef.current.getBoundingClientRect();
      const relativeY = clientY - rect.top;
      const percentage = Math.round(Math.max(0, Math.min(100, 100 - (relativeY / rect.height) * 100)));
      setBrightness(percentage);
      updateBrightness(percentage);
    },
    [updateBrightness]
  );

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    setIsDragging(true);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    handleSliderInteraction(e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    handleSliderInteraction(e.clientY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  // Toggle power
  const handlePowerToggle = async () => {
    try {
      if (isOn) {
        await turnOffLight(config.entityId);
      } else {
        await turnOnLight(config.entityId, { brightness_pct: 50 });
      }
      onStateChanged();
    } catch (err) {
      console.error('Failed to toggle power:', err);
    }
  };

  // Apply color preset
  const handleColorPreset = async (rgb: [number, number, number]) => {
    try {
      await turnOnLight(config.entityId, {
        rgb_color: rgb,
        brightness_pct: Math.max(brightness, 10),
      });
      onStateChanged();
    } catch (err) {
      console.error('Failed to set color:', err);
    }
  };

  return (
    <div className="light-modal-overlay" onClick={onClose}>
      <div className="light-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="light-modal-header">
          <button className="light-modal-close" onClick={onClose} aria-label="Sluiten">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="light-modal-title">
            <span className="text-xs text-gray-500">{config.name}</span>
            <span className="text-base font-semibold text-white">{config.name}</span>
          </div>
        </div>

        {/* Brightness display */}
        <div className="light-modal-brightness-label">
          <span className="text-4xl font-bold text-white">{brightness}%</span>
          <span className="text-sm text-gray-500 mt-1">Nu</span>
        </div>

        {/* Vertical brightness slider */}
        <div className="light-modal-slider-container">
          <div
            ref={sliderRef}
            className="light-modal-slider"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            style={{ touchAction: 'none' }}
          >
            {/* Inactive (top) portion */}
            <div
              className="light-modal-slider-inactive"
              style={{
                height: `${100 - brightness}%`,
                backgroundColor: dimColor,
              }}
            />
            {/* Active (bottom) portion */}
            <div
              className="light-modal-slider-active"
              style={{
                height: `${brightness}%`,
                backgroundColor: activeColor,
              }}
            >
              {/* Drag handle */}
              <div className="light-modal-slider-handle" />
            </div>
          </div>
        </div>

        {/* Power toggle */}
        <div className="light-modal-controls">
          <button
            className={`light-modal-power ${isOn ? 'light-modal-power-on' : ''}`}
            onClick={handlePowerToggle}
            aria-label="Aan/uit"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 3v9m-4.243-5.757A8 8 0 1016.243 6.243" />
            </svg>
          </button>
        </div>

        {/* Color presets */}
        <div className="light-modal-colors">
          <div className="light-modal-color-grid">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="light-modal-color-btn"
                style={{
                  backgroundColor: `rgb(${preset.rgb[0]}, ${preset.rgb[1]}, ${preset.rgb[2]})`,
                }}
                onClick={() => handleColorPreset(preset.rgb)}
                aria-label={preset.name}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
