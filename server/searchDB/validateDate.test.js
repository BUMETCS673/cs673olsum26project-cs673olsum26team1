// AI-USAGE SUMMARY
// Tools: Claude Code
// Overall AI Contribution: ~95%
// AI-Assisted Areas: Generation of unit tests
// Human Contributions: I prompted and reviewed all of the generated tests to ensure they accurately reflect the business logic and requirements. 
// Notes: I'm not very familair with Jest, so this was a good opportunity to learn more about unit tests in Jest. 


const { parseDate, isValidDate, getDateRange } = require('./validateDate');

describe('validateDate', () => {
  // ============================================
  // Tests for parseDate()
  // ============================================
  describe('parseDate', () => {
    describe('MM/DD/YYYY format', () => {
      test('parses single-digit month and day', () => {
        const result = parseDate('1/2/2004');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2004);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(2);
      });

      test('parses double-digit month and day', () => {
        const result = parseDate('12/25/2020');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2020);
        expect(result.getMonth()).toBe(11);
        expect(result.getDate()).toBe(25);
      });

      test('returns null for month > 12', () => {
        expect(parseDate('13/15/2004')).toBeNull();
      });

      test('returns null for day > 31', () => {
        expect(parseDate('1/32/2004')).toBeNull();
      });

      test('returns null for both invalid month and day', () => {
        expect(parseDate('13/32/2004')).toBeNull();
      });

      test('parses valid leap day (Feb 29 on leap year)', () => {
        const result = parseDate('2/29/2020');
        expect(result).toBeInstanceOf(Date);
        expect(result.getMonth()).toBe(1);
        expect(result.getDate()).toBe(29);
      });

      test('returns null for invalid leap day (Feb 29 on non-leap year)', () => {
        expect(parseDate('2/29/2021')).toBeNull();
      });
    });

    describe('YYYY-MM-DD format', () => {
      test('parses correctly', () => {
        const result = parseDate('2004-01-02');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2004);
        expect(result.getMonth()).toBe(0);
        expect(result.getDate()).toBe(2);
      });

      test('returns null for invalid month', () => {
        expect(parseDate('2004-13-01')).toBeNull();
      });

      test('returns null for invalid day', () => {
        expect(parseDate('2004-01-32')).toBeNull();
      });
    });

    describe('ISO 8601 format', () => {
      test('parses with Z timezone suffix', () => {
        const result = parseDate('2004-01-02T00:00:00Z');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2004);
      });

      test('parses with milliseconds', () => {
        const result = parseDate('2004-01-02T12:30:45.123Z');
        expect(result).toBeInstanceOf(Date);
      });
    });

    describe('null / empty / invalid inputs', () => {
      test('returns null for null', () => {
        expect(parseDate(null)).toBeNull();
      });

      test('returns null for undefined', () => {
        expect(parseDate(undefined)).toBeNull();
      });

      test('returns null for empty string', () => {
        expect(parseDate('')).toBeNull();
      });

      test('returns null for arbitrary text', () => {
        expect(parseDate('not-a-date')).toBeNull();
      });

      test('trims surrounding whitespace before parsing', () => {
        const result = parseDate('  2004-01-02  ');
        expect(result).toBeInstanceOf(Date);
        expect(result.getFullYear()).toBe(2004);
      });
    });
  });

  // ============================================
  // Tests for isValidDate()
  // ============================================
  describe('isValidDate', () => {
    test('returns true for valid MM/DD/YYYY', () => {
      expect(isValidDate('1/2/2004')).toBe(true);
    });

    test('returns true for valid YYYY-MM-DD', () => {
      expect(isValidDate('2004-01-02')).toBe(true);
    });

    test('returns true for valid ISO 8601', () => {
      expect(isValidDate('2004-01-02T00:00:00Z')).toBe(true);
    });

    test('returns false for invalid date string', () => {
      expect(isValidDate('not-a-date')).toBe(false);
    });

    test('returns false for out-of-range date', () => {
      expect(isValidDate('13/32/2004')).toBe(false);
    });

    test('returns false for empty string', () => {
      expect(isValidDate('')).toBe(false);
    });

    test('returns false for null', () => {
      expect(isValidDate(null)).toBe(false);
    });

    test('returns false for undefined', () => {
      expect(isValidDate(undefined)).toBe(false);
    });
  });

  // ============================================
  // Tests for getDateRange()
  // ============================================
  describe('getDateRange', () => {
    test('returns an object with gte and lt keys', () => {
      const range = getDateRange(new Date('2024-06-15'));
      expect(range).toHaveProperty('gte');
      expect(range).toHaveProperty('lt');
    });

    test('gte is UTC midnight (start of day) for the input date', () => {
      const input = new Date(2024, 5, 15, 14, 30, 0); // June 15 2024, 2:30 PM local
      const { gte } = getDateRange(input);
      expect(gte.getUTCHours()).toBe(0);
      expect(gte.getUTCMinutes()).toBe(0);
      expect(gte.getUTCSeconds()).toBe(0);
      expect(gte.getUTCMilliseconds()).toBe(0);
      expect(gte.getUTCFullYear()).toBe(2024);
      expect(gte.getUTCMonth()).toBe(5);
      expect(gte.getUTCDate()).toBe(15);
    });

    test('lt is UTC midnight at the start of the next day', () => {
      const input = new Date(2024, 5, 15);
      const { lt } = getDateRange(input);
      expect(lt.getUTCDate()).toBe(16);
      expect(lt.getUTCMonth()).toBe(5);
      expect(lt.getUTCFullYear()).toBe(2024);
      expect(lt.getUTCHours()).toBe(0);
      expect(lt.getUTCMinutes()).toBe(0);
      expect(lt.getUTCSeconds()).toBe(0);
      expect(lt.getUTCMilliseconds()).toBe(0);
    });

    test('lt is exactly 24 hours after gte', () => {
      const input = new Date(2024, 5, 15);
      const { gte, lt } = getDateRange(input);
      expect(lt - gte).toBe(24 * 60 * 60 * 1000);
    });

    test('rolls month over correctly at month boundary', () => {
      const input = new Date(2024, 0, 31); // Jan 31
      const { lt } = getDateRange(input);
      expect(lt.getUTCMonth()).toBe(1); // February
      expect(lt.getUTCDate()).toBe(1);
    });

    test('rolls year over correctly at year boundary', () => {
      const input = new Date(2024, 11, 31); // Dec 31
      const { lt } = getDateRange(input);
      expect(lt.getUTCFullYear()).toBe(2025);
      expect(lt.getUTCMonth()).toBe(0);
      expect(lt.getUTCDate()).toBe(1);
    });

    test('does not mutate the input date', () => {
      const input = new Date(2024, 5, 15, 14, 30, 0);
      const originalTime = input.getTime();
      getDateRange(input);
      expect(input.getTime()).toBe(originalTime);
    });
  });
});
