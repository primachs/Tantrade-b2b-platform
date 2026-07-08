import { describe, it, expect, vi } from 'vitest';
import {
  validateNida,
  validateTin,
  validateBrela,
  validateMobile,
  validateRegionDistrict,
  firstError,
  formatApiError
} from './tanzania';
import * as regions from '../geography/tanzaniaRegions';

vi.mock('../geography/tanzaniaRegions', () => ({
  isValidDistrict: vi.fn(),
}));

describe('Tanzania Validation', () => {
  describe('validateNida', () => {
    it('returns error if empty', () => {
      expect(validateNida('')).toBe('NIDA number is required.');
    });
    it('returns error if length is not 20 digits', () => {
      expect(validateNida('1234567890')).toBe('NIDA must be exactly 20 digits.');
      expect(validateNida('1234567890123456789A')).toBe('NIDA must be exactly 20 digits.');
    });
    it('returns null for valid NIDA', () => {
      expect(validateNida('12345678901234567890')).toBeNull();
    });
  });

  describe('validateTin', () => {
    it('returns error if empty', () => {
      expect(validateTin('')).toBe('TIN is required.');
    });
    it('returns error if length is not 9 digits', () => {
      expect(validateTin('12345678')).toBe('TIN must be exactly 9 digits.');
    });
    it('returns null for valid TIN', () => {
      expect(validateTin('123456789')).toBeNull();
    });
  });

  describe('validateBrela', () => {
    it('returns error if empty', () => {
      expect(validateBrela('')).toBe('BRELA number is required.');
    });
    it('returns error if invalid format', () => {
      expect(validateBrela('12345')).toBe('BRELA must be 6–12 alphanumeric characters.');
      expect(validateBrela('1234567890123')).toBe('BRELA must be 6–12 alphanumeric characters.');
      expect(validateBrela('abc-def')).toBe('BRELA must be 6–12 alphanumeric characters.');
    });
    it('returns null for valid BRELA', () => {
      expect(validateBrela('123456')).toBeNull();
      expect(validateBrela('AB12345')).toBeNull();
    });
  });

  describe('validateMobile', () => {
    it('returns error if empty and required', () => {
      expect(validateMobile('', true)).toBe('Mobile number is required.');
    });
    it('returns null if empty and not required', () => {
      expect(validateMobile('', false)).toBeNull();
    });
    it('returns error if invalid format', () => {
      expect(validateMobile('1234567')).toBe('Enter a valid Tanzania mobile number (e.g. 0712345678).');
      expect(validateMobile('0812345678')).toBe('Enter a valid Tanzania mobile number (e.g. 0712345678).');
    });
    it('returns null for valid Mobile', () => {
      expect(validateMobile('0712345678')).toBeNull();
      expect(validateMobile('+255712345678')).toBeNull();
    });
  });

  describe('validateRegionDistrict', () => {
    it('returns errors if region or district are missing', () => {
      expect(validateRegionDistrict('', '')).toEqual({
        region: 'Region is required.',
        district: 'District is required.'
      });
    });
    it('returns error if district is invalid for region', () => {
      vi.mocked(regions.isValidDistrict).mockReturnValue(false);
      expect(validateRegionDistrict('Dar es Salaam', 'Invalid')).toEqual({
        district: 'Select a district that belongs to the chosen region.'
      });
    });
    it('returns empty object if valid', () => {
      vi.mocked(regions.isValidDistrict).mockReturnValue(true);
      expect(validateRegionDistrict('Dar es Salaam', 'Ilala')).toEqual({});
    });
  });

  describe('firstError', () => {
    it('returns the first error message', () => {
      expect(firstError({ name: 'Name error', age: 'Age error' })).toBe('Name error');
    });
    it('returns null if no errors', () => {
      expect(firstError({})).toBeNull();
    });
  });

  describe('formatApiError', () => {
    it('returns error message if Error instance', () => {
      expect(formatApiError(new Error('Test error'))).toBe('Test error');
    });
    it('returns fallback message if not an Error instance', () => {
      expect(formatApiError('string error')).toBe('Something went wrong. Please try again.');
      expect(formatApiError('string error', 'Custom fallback')).toBe('Custom fallback');
    });
  });
});
