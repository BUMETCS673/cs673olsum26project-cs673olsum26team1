// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~95%
// AI-Assisted Areas: Generation of unit tests
// Human Contributions: I prompted and reviewed all of the generated tests to ensure they accurately reflect the business logic and requirements. 
// Notes: I'm not very familair with Jest, so this was a good opportunity to learn more about unit tests in Jest. 


/**
 * Unit tests for searchDB.js
 * Tests all search and date parsing functionality
 */

const { searchPatients } = require('../../../code/server/searchDB/searchDB');
const { parseDate, isValidDate } = require('../../../code/server/searchDB/validateDate');

describe('searchDB', () => {
  let mockPrisma;

  beforeEach(() => {
    // Mock Prisma client
    mockPrisma = {
      patient: {
        findMany: jest.fn()
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  // ============================================
  // Tests for searchPatients()
  // ============================================
  describe('searchPatients', () => {
    const mockPatients = [
      {
        id: 1,
        name: 'John Doe',
        mrn: '12345',
        dateOfBirth: new Date('1990-05-15')
      },
      {
        id: 2,
        name: 'Jane Smith',
        mrn: '67890',
        dateOfBirth: new Date('1985-03-22')
      }
    ];

    test('should return all patients when no search query provided', async () => {
      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);

      const result = await searchPatients(mockPrisma, null);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith({ orderBy: { createdAt: 'desc' } });
      expect(result).toEqual(mockPatients);
    });

    test('should return all patients when empty string search query provided', async () => {
      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);

      const result = await searchPatients(mockPrisma, '');

      expect(result).toEqual(mockPatients);
    });

    test('should return all patients when whitespace-only search query provided', async () => {
      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);

      const result = await searchPatients(mockPrisma, '   ');

      expect(result).toEqual(mockPatients);
    });

    test('should search by patient name (case-insensitive)', async () => {
      const searchResults = [mockPatients[0]];
      mockPrisma.patient.findMany.mockResolvedValue(searchResults);

      const result = await searchPatients(mockPrisma, 'john');

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith({
        where: {
          OR: expect.arrayContaining([
            expect.objectContaining({
              name: expect.objectContaining({ contains: 'john', mode: 'insensitive' })
            })
          ])
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(searchResults);
    });

    test('should search by MRN number (case-insensitive)', async () => {
      const searchResults = [mockPatients[0]];
      mockPrisma.patient.findMany.mockResolvedValue(searchResults);

      const result = await searchPatients(mockPrisma, '12345');

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith({
        where: {
          OR: expect.arrayContaining([
            expect.objectContaining({
              mrn: expect.objectContaining({ contains: '12345', mode: 'insensitive' })
            })
          ])
        },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual(searchResults);
    });

    test('should search by date of birth in MM/DD/YYYY format', async () => {
      const searchResults = [mockPatients[0]];
      mockPrisma.patient.findMany.mockResolvedValue(searchResults);

      await searchPatients(mockPrisma, '5/15/1990');

      expect(mockPrisma.patient.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.patient.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toContainEqual(
        expect.objectContaining({
          dateOfBirth: expect.objectContaining({
            gte: expect.any(Date),
            lt: expect.any(Date)
          })
        })
      );
    });

    test('should search by date of birth in YYYY-MM-DD format', async () => {
      const searchResults = [mockPatients[0]];
      mockPrisma.patient.findMany.mockResolvedValue(searchResults);

      await searchPatients(mockPrisma, '1990-05-15');

      expect(mockPrisma.patient.findMany).toHaveBeenCalled();
      const callArgs = mockPrisma.patient.findMany.mock.calls[0][0];
      expect(callArgs.where.OR).toContainEqual(
        expect.objectContaining({
          dateOfBirth: expect.objectContaining({
            gte: expect.any(Date),
            lt: expect.any(Date)
          })
        })
      );
    });

    test('should not include date search when date format is invalid', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);

      await searchPatients(mockPrisma, 'invalid-date');

      const callArgs = mockPrisma.patient.findMany.mock.calls[0][0];
      const dateSearches = callArgs.where.OR.filter(or => or.dateOfBirth);
      expect(dateSearches).toHaveLength(0);
    });

    test('should trim search query before using it', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);

      await searchPatients(mockPrisma, '  john  ');

      const callArgs = mockPrisma.patient.findMany.mock.calls[0][0];
      // Check that 'john' (without spaces) is in the search
      expect(callArgs.where.OR[0].name.contains).toBe('john');
    });

    test('should return empty array when no matches found', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);

      const result = await searchPatients(mockPrisma, 'NonExistent');

      expect(result).toEqual([]);
    });

    test('should throw error with descriptive message on database failure', async () => {
      const dbError = new Error('Database connection lost');
      mockPrisma.patient.findMany.mockRejectedValue(dbError);

      await expect(searchPatients(mockPrisma, 'john')).rejects.toThrow('Patient search failed');
    });

    test('should search by partial name match', async () => {
      const searchResults = [mockPatients[0]];
      mockPrisma.patient.findMany.mockResolvedValue(searchResults);

      const result = await searchPatients(mockPrisma, 'Doe');

      expect(result).toEqual(searchResults);
    });

    test('should search by partial MRN match', async () => {
      const searchResults = [mockPatients[0]];
      mockPrisma.patient.findMany.mockResolvedValue(searchResults);

      const result = await searchPatients(mockPrisma, '123');

      expect(result).toEqual(searchResults);
    });

    test('should include all three search conditions in OR clause', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);

      await searchPatients(mockPrisma, 'test');

      const callArgs = mockPrisma.patient.findMany.mock.calls[0][0];
      const orConditions = callArgs.where.OR;
      
      // Should have at least 2 conditions (name and MRN)
      // May have 3 if the date is valid
      expect(orConditions.length).toBeGreaterThanOrEqual(2);
      expect(orConditions.some(or => or.name)).toBe(true);
      expect(orConditions.some(or => or.mrn)).toBe(true);
    });
  });
});
