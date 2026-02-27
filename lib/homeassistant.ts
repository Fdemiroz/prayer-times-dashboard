/**
 * Home Assistant REST API client
 * Handles entity state fetching and service calls for lights, vacuum, and camera
 */

import type { HAEntityState, HALightAttributes, HAVacuumAttributes } from './types';

// HA configuration from environment
const HA_URL = process.env.NEXT_PUBLIC_HA_URL || 'http://192.168.2.21:8123';
const HA_TOKEN = process.env.NEXT_PUBLIC_HA_TOKEN || '';

// Common headers for all HA API requests
function getHeaders(): HeadersInit {
  return {
    Authorization: `Bearer ${HA_TOKEN}`,
    'Content-Type': 'application/json',
  };
}

// =============================================================================
// STATE FETCHING
// =============================================================================

/**
 * Fetch the state of a single entity
 */
export async function fetchEntityState(entityId: string): Promise<HAEntityState> {
  const response = await fetch(`${HA_URL}/api/states/${entityId}`, {
    headers: getHeaders(),
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch state for ${entityId}: ${response.status}`);
  }

  return response.json();
}

/**
 * Fetch states of multiple entities in parallel
 */
export async function fetchEntityStates(entityIds: string[]): Promise<Record<string, HAEntityState>> {
  const results = await Promise.allSettled(
    entityIds.map((id) => fetchEntityState(id))
  );

  const states: Record<string, HAEntityState> = {};
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      states[entityIds[index]] = result.value;
    }
  });

  return states;
}

// =============================================================================
// LIGHT SERVICES
// =============================================================================

/**
 * Toggle a light on/off
 */
export async function toggleLight(entityId: string): Promise<void> {
  await fetch(`${HA_URL}/api/services/light/toggle`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ entity_id: entityId }),
  });
}

/**
 * Turn on a light with optional brightness and color
 */
export async function turnOnLight(
  entityId: string,
  options?: {
    brightness_pct?: number;
    rgb_color?: [number, number, number];
    color_temp_kelvin?: number;
  }
): Promise<void> {
  await fetch(`${HA_URL}/api/services/light/turn_on`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      entity_id: entityId,
      ...options,
    }),
  });
}

/**
 * Turn off a light
 */
export async function turnOffLight(entityId: string): Promise<void> {
  await fetch(`${HA_URL}/api/services/light/turn_off`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ entity_id: entityId }),
  });
}

// =============================================================================
// VACUUM SERVICES
// =============================================================================

/**
 * Start the vacuum
 */
export async function startVacuum(entityId: string): Promise<void> {
  await fetch(`${HA_URL}/api/services/vacuum/start`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ entity_id: entityId }),
  });
}

/**
 * Return vacuum to dock
 */
export async function dockVacuum(entityId: string): Promise<void> {
  await fetch(`${HA_URL}/api/services/vacuum/return_to_base`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ entity_id: entityId }),
  });
}

// =============================================================================
// CAMERA
// =============================================================================

/**
 * Get camera proxy URL (for displaying snapshots)
 */
export function getCameraProxyUrl(entityId: string): string {
  return `${HA_URL}/api/camera_proxy/${entityId}?token=${HA_TOKEN}`;
}

/**
 * Get camera snapshot as a blob URL (avoids CORS issues with img tags)
 */
export async function fetchCameraSnapshot(entityId: string): Promise<string> {
  const response = await fetch(`${HA_URL}/api/camera_proxy/${entityId}`, {
    headers: {
      Authorization: `Bearer ${HA_TOKEN}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch camera snapshot: ${response.status}`);
  }

  const blob = await response.blob();
  return URL.createObjectURL(blob);
}

// =============================================================================
// HELPERS
// =============================================================================

/**
 * Extract brightness percentage from light attributes
 */
export function getBrightnessPercent(attributes: HALightAttributes): number {
  if (attributes.brightness === undefined) return 0;
  return Math.round((attributes.brightness / 255) * 100);
}

/**
 * Extract RGB color from light attributes
 */
export function getRgbColor(attributes: HALightAttributes): [number, number, number] | null {
  return attributes.rgb_color || null;
}

/**
 * Get vacuum status label in Dutch
 */
export function getVacuumStatusLabel(state: string): string {
  const labels: Record<string, string> = {
    docked: 'Gedockt',
    cleaning: 'Aan het stofzuigen',
    paused: 'Gepauzeerd',
    returning: 'Terug naar dock',
    idle: 'Inactief',
    error: 'Fout',
  };
  return labels[state] || state;
}
