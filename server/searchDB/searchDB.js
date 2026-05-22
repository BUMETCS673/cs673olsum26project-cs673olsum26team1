/**
 * Patient search module
 * Handles searching and filtering patient records by name, MRN, or date of birth
 */

const { computeProgress } = require('./calculateProgress');
const { parseDate, isValidDate, getDateRange } = require('./validateDate');

/**
 * Search for patients by name, MRN, or date of birth.
 * Optionally filter by specialistType (visitType) and insuranceStatus (insurance).
 * @param {PrismaClient} prisma - Prisma client instance
 * @param {string} searchQuery - Search query string
 * @param {{ specialistType?: string, insuranceStatus?: string }} filters - Optional filters
 * @returns {Promise<Array>} Array of matching patient records
 */
const searchPatients = async (prisma, searchQuery, filters = {}) => {
  const { specialistType, insuranceStatus } = filters;
  const hasSearch = searchQuery && searchQuery.trim() !== '';
  const hasFilters = specialistType || insuranceStatus;

  if (!hasSearch && !hasFilters) {
    return await prisma.patient.findMany();
  }

  try {
    // Prisma treats sibling keys at the same level as implicit AND conditions.
    // When no filters are present we only emit { OR: [...] }, preserving the
    // original query shape so existing behaviour and tests are unchanged.
    const where = {};

    if (specialistType) where.visitType = specialistType;
    if (insuranceStatus) where.insurance = insuranceStatus;

    if (hasSearch) {
      const parsedDate = parseDate(searchQuery);
      const dateRange = parsedDate ? getDateRange(parsedDate) : null;

      where.OR = [
        { name: { contains: searchQuery.trim(), mode: 'insensitive' } },
        { mrn: { contains: searchQuery.trim(), mode: 'insensitive' } },
        ...(dateRange
          ? [{ dateOfBirth: { gte: dateRange.gte, lt: dateRange.lt } }]
          : []),
      ];
    }

    const patients = await prisma.patient.findMany({ where });
    return patients;
  } catch (error) {
    throw new Error(`Patient search failed: ${error.message}`);
  }
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

module.exports = {
  searchPatients,
  getAllPatients,
  computeProgress,
  isValidDate,
  parseDate
};
