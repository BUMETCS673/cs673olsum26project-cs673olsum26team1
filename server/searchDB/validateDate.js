/**
 * Date parsing and validation utilities for patient search queries.
 * Supports formats: MM/DD/YYYY, YYYY-MM-DD, ISO 8601
 */

/**
 * @param {string} dateString
 * @returns {Date|null}
 */
const parseDate = (dateString) => {
  if (!dateString) return null;

  const trimmed = dateString.trim();

  // Try MM/DD/YYYY format (1/2/2004 or 12/25/2020)
  const mmddyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime()) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)) {
      return date;
    }
    return null;
  }

  // Try YYYY-MM-DD format
  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime()) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)) {
      return date;
    }
    return null;
  }

  // Try ISO 8601 format with time component
  const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
  if (isoMatch) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  return null;
};

/**
 * @param {string} dateString
 * @returns {boolean}
 */
const isValidDate = (dateString) => parseDate(dateString) !== null;

/**
 * Returns a UTC [start-of-day, start-of-next-day) range for Prisma date queries.
 * Uses Date.UTC so the range matches how dates are stored in the DB (UTC midnight).
 * @param {Date} date
 * @returns {{ gte: Date, lt: Date }}
 */
const getDateRange = (date) => {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  return { gte: start, lt: end };
};

module.exports = { parseDate, isValidDate, getDateRange };
