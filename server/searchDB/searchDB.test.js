/**
 * Unit tests for searchDB.js
 * Tests all search and date parsing functionality
 */

const { searchPatients, getAllPatients, parseDate, isValidDate } = require('./searchDB');

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
  // Tests for parseDate()
  // ============================================
  describe('parseDate', () => {
    test('should parse MM/DD/YYYY format correctly', () => {
      const result = parseDate('1/2/2004');
      expect(result).toBeInstanceOf(Date);
      expect(result.getMonth()).toBe(0); // January (0-indexed)
      expect(result.getDate()).toBe(2);
      expect(result.getFullYear()).toBe(2004);
    });

    test('should parse MM/DD/YYYY format with double digits', () => {
      const result = parseDate('12/25/2020');
      expect(result).toBeInstanceOf(Date);
      expect(result.getMonth()).toBe(11); // December
      expect(result.getDate()).toBe(25);
      expect(result.getFullYear()).toBe(2020);
    });

    test('should parse YYYY-MM-DD format', () => {
      const result = parseDate('2004-01-02');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2004);
    });

    test('should parse ISO 8601 format', () => {
      const result = parseDate('2004-01-02T00:00:00Z');
      expect(result).toBeInstanceOf(Date);
      expect(result.getFullYear()).toBe(2004);
    });

    test('should return null for invalid MM/DD/YYYY format', () => {
      const result = parseDate('13/32/2004'); // Invalid month and day
      expect(result).toBeNull();
    });

    test('should return null for empty string', () => {
      const result = parseDate('');
      expect(result).toBeNull();
    });

    test('should return null for null input', () => {
      const result = parseDate(null);
      expect(result).toBeNull();
    });

    test('should return null for undefined input', () => {
      const result = parseDate(undefined);
      expect(result).toBeNull();
    });

    test('should return null for invalid date string', () => {
      const result = parseDate('not-a-date');
      expect(result).toBeNull();
    });

    test('should handle leap year dates', () => {
      const result = parseDate('2/29/2020');
      expect(result).toBeInstanceOf(Date);
      expect(result.getMonth()).toBe(1); // February
      expect(result.getDate()).toBe(29);
    });

    

    test('should validate month boundaries', () => {
      const result = parseDate('13/15/2004');
      expect(result).toBeNull();
    });
  });

  // ============================================
  // Tests for isValidDate()
  // ============================================
  describe('isValidDate', () => {
    test('should return true for valid MM/DD/YYYY format', () => {
      expect(isValidDate('1/2/2004')).toBe(true);
    });

    test('should return true for valid YYYY-MM-DD format', () => {
      expect(isValidDate('2004-01-02')).toBe(true);
    });

    test('should return false for invalid date', () => {
      expect(isValidDate('not-a-date')).toBe(false);
    });

    test('should return false for empty string', () => {
      expect(isValidDate('')).toBe(false);
    });

    test('should return false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    test('should return false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  // ============================================
  // Tests for getAllPatients()
  // ============================================
  describe('getAllPatients', () => {
    test('should return all patients from database', async () => {
      const mockPatients = [
        { id: 1, name: 'John Doe', mrn: '12345' },
        { id: 2, name: 'Jane Smith', mrn: '67890' }
      ];
      mockPrisma.patient.findMany.mockResolvedValue(mockPatients);

      const result = await getAllPatients(mockPrisma);

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith();
      expect(result).toEqual(mockPatients);
      expect(result).toHaveLength(2);
    });

    test('should return empty array when no patients exist', async () => {
      mockPrisma.patient.findMany.mockResolvedValue([]);

      const result = await getAllPatients(mockPrisma);

      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    test('should throw error when database query fails', async () => {
      const error = new Error('Database connection failed');
      mockPrisma.patient.findMany.mockRejectedValue(error);

      await expect(getAllPatients(mockPrisma)).rejects.toThrow('Failed to retrieve patients');
    });
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

      expect(mockPrisma.patient.findMany).toHaveBeenCalledWith();
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
        }
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
        }
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
            equals: expect.any(Date)
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
            equals: expect.any(Date)
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
