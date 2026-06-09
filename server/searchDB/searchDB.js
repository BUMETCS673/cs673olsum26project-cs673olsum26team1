// AI-USAGE SUMMARY
// Tools: VS Code Copilot, Claude Code
// Overall AI Contribution: ~90%
// AI-Assisted Areas: Initial code generation
// Human Contributions: Providing the business logic and modularizing the search logic.

const { computeProgress } = require('./calculateProgress');
const { parseDate, getDateRange } = require('./validateDate');

const searchPatients = async (prisma, searchQuery, filters = {}) => {
  const { specialistType, insuranceStatus } = filters;
  const hasSearch = searchQuery && searchQuery.trim() !== '';
  const hasFilters = specialistType || insuranceStatus;

  if (!hasSearch && !hasFilters) {
    return await prisma.patient.findMany({ orderBy: { createdAt: 'desc' } });
  }

  try {
    const where = {};

    if (specialistType) where.visitType = specialistType;
    if (insuranceStatus) where.insurance = insuranceStatus;

    if (hasSearch) {
      const parsedDate = parseDate(searchQuery);
      const dateRange = parsedDate ? getDateRange(parsedDate) : null;

      where.OR = [
        { name: { contains: searchQuery.trim(), mode: 'insensitive' } },
        { mrn: { contains: searchQuery.trim(), mode: 'insensitive' } },
        ...(dateRange ? [{ dateOfBirth: { gte: dateRange.gte, lt: dateRange.lt } }] : []),
      ];
    }

    return await prisma.patient.findMany({ where, orderBy: { createdAt: 'desc' } });
  } catch (error) {
    throw new Error(`Patient search failed: ${error.message}`);
  }
};

module.exports = { searchPatients, computeProgress };
