// AI-USAGE SUMMARY
// Tools: Claude Code, VS Code Copilot
// Overall AI Contribution: ~100%
// AI-Assisted Areas: Initial code generation and date parsing logic
// Human Contributions: Modularizing the date parsing and validation logic into a separate file.

const parseDate = (dateString) => {
  if (!dateString) return null;

  const trimmed = dateString.trim();

  const mmddyyyyMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mmddyyyyMatch) {
    const [, month, day, year] = mmddyyyyMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime()) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)) {
      return date;
    }
    return null;
  }

  const yyyymmddMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (yyyymmddMatch) {
    const [, year, month, day] = yyyymmddMatch;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    if (!isNaN(date.getTime()) && date.getMonth() === Number(month) - 1 && date.getDate() === Number(day)) {
      return date;
    }
    return null;
  }

  const isoMatch = trimmed.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/);
  if (isoMatch) {
    const date = new Date(trimmed);
    if (!isNaN(date.getTime())) return date;
  }

  return null;
};

const isValidDate = (dateString) => parseDate(dateString) !== null;

const getDateRange = (date) => {
  const start = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const end = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate() + 1));
  return { gte: start, lt: end };
};

module.exports = { parseDate, isValidDate, getDateRange };
