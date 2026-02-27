'use client';

/**
 * CameraFeed - Auto-refreshing camera snapshot from HA camera proxy
 * Refreshes every 10 seconds to show near-live feed
 */

import { useEffect, useState, useCallback } from 'react';
import { fetchCameraSnapshot } from '@/lib/homeassistant';

interface CameraFeedProps {
  entityId: string;
  refreshInterval?: number; // ms, default 10s
}

export default function CameraFeed({ entityId, refreshInterval = 10000 }: CameraFeedProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState(false);

  const loadSnapshot = useCallback(async () => {
    try {
      const url = await fetchCameraSnapshot(entityId);
      setImageUrl((prev) => {
        // Revoke previous blob URL to prevent memory leaks
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setError(false);
    } catch {
      console.error('Failed to load camera snapshot');
      setError(true);
    }
  }, [entityId]);

  useEffect(() => {
    loadSnapshot();
    const timer = setInterval(loadSnapshot, refreshInterval);
    return () => {
      clearInterval(timer);
      // Cleanup blob URL on unmount
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadSnapshot, refreshInterval]);

  return (
    <div className="camera-feed">
      {error || !imageUrl ? (
        <div className="camera-placeholder">
          <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <span className="text-xs text-gray-500 mt-2">Parkeerplaats</span>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Parkeerplaats camera"
          className="camera-image"
        />
      )}
    </div>
  );
}
