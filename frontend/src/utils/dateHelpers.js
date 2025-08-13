// src/utils/dateHelpers.js

/**
 * Parses a YYYY-MM-DD string into a Date object, treating it as a local date.
 * This avoids timezone shifts when the input is a date-only string.
 * @param {string} dateString - The date string in 'YYYY-MM-DD' format.
 * @returns {Date} A Date object representing the local date.
 */
const parseDateAsLocal = (dateString) => {
  const [year, month, day] = dateString.split('-').map(Number);
  // Month is 0-indexed in Date constructor
  return new Date(year, month - 1, day);
};

/**
 * Formats a date string or Date object into a human-readable string (e.g., "Aug 2, 2025").
 * Handles 'YYYY-MM-DD' strings by treating them as local dates to prevent timezone issues.
 * @param {string | Date} dateInput - The date string (e.g., "2025-07-30") or Date object.
 * @returns {string} Formatted date string.
 */
export const formatDate = (dateInput) => {
  if (!dateInput) return '';

  let date;
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    // If it's a YYYY-MM-DD string, parse it as a local date
    date = parseDateAsLocal(dateInput);
  } else {
    // Otherwise, assume it's a Date object or a full date string parsable by Date constructor
    date = new Date(dateInput);
  }

  // Ensure the date is valid before formatting
  if (isNaN(date.getTime())) {
    console.warn("Invalid date input for formatDate:", dateInput);
    return '';
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/**
 * Formats a date string or Date object into 'YYYY-MM-DD' format, suitable for HTML date inputs.
 * @param {string | Date} dateInput - The date string (e.g., "2025-07-30") or Date object.
 * @returns {string} Formatted date string in 'YYYY-MM-DD' format.
 */
export const formatDateForInput = (dateInput) => {
  if (!dateInput) return '';
  let date;
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    date = parseDateAsLocal(dateInput);
  } else {
    date = new Date(dateInput);
  }

  // Ensure the date is valid before formatting
  if (isNaN(date.getTime())) {
    console.warn("Invalid date input for formatDateForInput:", dateInput);
    return '';
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Formats a date string or Date object into a human-readable date and time string (e.g., "Jul 30, 2025, 02:10 AM").
 * @param {string | Date} dateInput - The date string or Date object.
 * @returns {string} Formatted date and time string.
 */
export const formatDateTime = (dateInput) => {
  if (!dateInput) return '';
  let date;
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    date = parseDateAsLocal(dateInput);
  } else {
    date = new Date(dateInput);
  }
  if (isNaN(date.getTime())) {
    console.warn("Invalid date input for formatDateTime:", dateInput);
    return '';
  }
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true, // Use 12-hour format with AM/PM
  });
};


/**
 * Checks if a given date is in the past compared to today.
 * @param {string | Date} dateInput - The date string or Date object to check.
 * @returns {boolean} True if the date is overdue, false otherwise.
 */
export const isOverdue = (dateInput) => {
  if (!dateInput) return false;

  let targetDate;
  if (typeof dateInput === 'string' && dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
    targetDate = parseDateAsLocal(dateInput);
  } else {
    targetDate = new Date(dateInput);
  }

  if (isNaN(targetDate.getTime())) {
    console.warn("Invalid date input for isOverdue:", dateInput);
    return false;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize today to start of day
  targetDate.setHours(0, 0, 0, 0); // Normalize target date to start of day

  return targetDate < today;
};
