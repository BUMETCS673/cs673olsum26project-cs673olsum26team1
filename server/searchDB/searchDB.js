// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation
// Human Contributions: Providing the business logic (patients, specialists, insurance, etc.) 
// and modularizing the search logic. Originally, the AI put it all in patients.js.
// Notes: see below for detailed breakdown of contributions and modifications.

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
// AI-ASSISTED: YES 
// Tool: Claude Code
// Prompt Summary: My prompt included the user story and acceptance tests for the coordinator dashboard, 
// which included the requirement for a patient search by MRN, name, or date of birth, as well as filtering by specialist type and insurance status.
// AI Contribution: Initial draft (~90%) 
// Modifications: 
//  - Refactored from inline code in patients.js to the searchDB module for better modularity and reusability. 
// Verification: 
// - Manually tested the route in the coordinator dashboard to ensure data is fetched and displayed correctly, and that the search and filter functionalities work as expected.
// Confidence: High
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
  //AI notes similar to searchPatients
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
