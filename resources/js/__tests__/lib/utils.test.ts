import { describe, it, expect } from 'vitest';
import { formatNumberToRupiah, parseRupiahToString, parseRupiahToNumber } from '@/lib/utils';

describe('formatNumberToRupiah', () => {
    it('formats whole numbers with dot separators', () => {
        expect(formatNumberToRupiah(1500000)).toBe('1.500.000');
    });

    it('formats small numbers', () => {
        expect(formatNumberToRupiah(500)).toBe('500');
    });

    it('formats thousands', () => {
        expect(formatNumberToRupiah(1000)).toBe('1.000');
    });

    it('returns empty for null/undefined', () => {
        expect(formatNumberToRupiah(null)).toBe('');
        expect(formatNumberToRupiah(undefined)).toBe('');
    });

    it('returns empty for empty string', () => {
        expect(formatNumberToRupiah('')).toBe('');
    });

    it('handles string input', () => {
        expect(formatNumberToRupiah('750000')).toBe('750.000');
    });
});

describe('parseRupiahToString', () => {
    it('removes dot separators', () => {
        expect(parseRupiahToString('1.500.000')).toBe('1500000');
    });

    it('returns empty for empty string', () => {
        expect(parseRupiahToString('')).toBe('');
    });

    it('strips leading zero', () => {
        expect(parseRupiahToString('0123')).toBe('123');
    });

    it('passes through plain numbers', () => {
        expect(parseRupiahToString('50000')).toBe('50000');
    });

    it('returns empty for non-numeric input', () => {
        expect(parseRupiahToString('abc')).toBe('');
    });
});

describe('parseRupiahToNumber', () => {
    it('converts formatted string to number', () => {
        expect(parseRupiahToNumber('1.500.000')).toBe(1500000);
    });

    it('handles plain number strings', () => {
        expect(parseRupiahToNumber('50000')).toBe(50000);
    });

    it('returns 0 for empty string', () => {
        expect(parseRupiahToNumber('')).toBe(0);
    });

    it('returns 0 for non-numeric input', () => {
        expect(parseRupiahToNumber('abc')).toBe(0);
    });
});
