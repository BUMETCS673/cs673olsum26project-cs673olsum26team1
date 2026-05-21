/**
 * Patient search module
 * Handles searching and filtering patient records by name, MRN, or date of birth
 */

/**
 * Search for patients by name, MRN, or date of birth
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} searchQuery - Search query string
 * @returns {Promise<Array>} Array of matching patient records
 */
const searchPatients = async (prisma, searchQuery) => {
  if (!searchQuery || searchQuery.trim() === '') {
    // Return all patients if no search query
    return await prisma.patient.findMany();
  }

  try {
    const parsedDate = parseDate(searchQuery);
    const dateRange = parsedDate ? getDateRange(parsedDate) : null;
    
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          // Search by name (case-insensitive)
          {
            name: {
              contains: searchQuery.trim(),
              mode: 'insensitive'
            }
          },
          // Search by MRN (case-insensitive)
          {
            mrn: {
              contains: searchQuery.trim(),
              mode: 'insensitive'
            }
          },
          // Search by date of birth (if valid date parsed)
          ...(dateRange
            ? [
              {
                dateOfBirth: {
                  gte: dateRange.gte,
                  lt: dateRange.lt
                }
              }
            ]
            : [])
        ]
      }
    });

    return patients;
  } catch (error) {
    throw new Error(`Patient search failed: ${error.message}`);
  }
};

const getDateRange = (date) => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { gte: start, lt: end };
};

/**
 * Get all patients without filtering
 * @param {PrismaClient} prisma - Prisma client instance
 * @returns {Promise<Array>} Array of all patient records
 */
const getAllPatients = async (prisma) => {
  try {
    return await prisma.patient.findMany();
  } catch (error) {
    throw new Error(`Failed to retrieve patients: ${error.message}`);
  }
};

/**
 * Validate if a string is a valid date format and parse it
 * Supports formats: MM/DD/YYYY, YYYY-MM-DD, ISO 8601
 * @param {string} dateString - Date string to validate and parse
 * @returns {Date|null} Parsed Date object if valid, null otherwise
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
 * Validate if a string is a valid date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if the string is a valid date
 */
const isValidDate = (dateString) => {
  return parseDate(dateString) !== null;
};

module.exports = {
  searchPatients,
  getAllPatients,
  isValidDate,
  parseDate
};
