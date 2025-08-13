// src/utils/utils.js

/**
 * Format duration from seconds to "HH:mm:ss" or "mm:ss" format
 * @param {number} seconds Total seconds to format
 * @param {boolean} showHours Whether to show hours even if zero
 * @returns {string} Formatted time string
 */
export const formatDuration = (seconds, showHours = false) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  const hh = h.toString().padStart(2, '0');
  const mm = m.toString().padStart(2, '0');
  const ss = s.toString().padStart(2, '0');

  if (showHours || h > 0) {
    return `${hh}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
};

/**
 * Format seconds into "mm:ss"
 * Used specifically for timers
 * @param {number} seconds
 * @returns {string}
 */
export const formatTimerTime = (seconds) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// Add other helper functions here as needed
