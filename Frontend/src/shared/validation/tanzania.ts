import { isValidDistrict } from "../geography/tanzaniaRegions";

export type FieldErrors = Record<string, string>;

const NIDA_REGEX = /^\d{20}$/;
const TIN_REGEX = /^\d{9}$/;
const BRELA_REGEX = /^[A-Za-z0-9]{6,12}$/;
const MOBILE_REGEX = /^(\+255|0)[67]\d{8}$/;

export function validateNida(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "NIDA number is required.";
  if (!NIDA_REGEX.test(trimmed)) return "NIDA must be exactly 20 digits.";
  return null;
}

export function validateTin(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "TIN is required.";
  if (!TIN_REGEX.test(trimmed)) return "TIN must be exactly 9 digits.";
  return null;
}

export function validateBrela(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return "BRELA number is required.";
  if (!BRELA_REGEX.test(trimmed)) return "BRELA must be 6–12 alphanumeric characters.";
  return null;
}

export function validateMobile(value: string, required = false): string | null {
  const trimmed = value.trim();
  if (!trimmed) return required ? "Mobile number is required." : null;
  if (!MOBILE_REGEX.test(trimmed)) return "Enter a valid Tanzania mobile number (e.g. 0712345678).";
  return null;
}

export function validateRegionDistrict(region: string, district: string): FieldErrors {
  const errors: FieldErrors = {};
  if (!region.trim()) errors.region = "Region is required.";
  if (!district.trim()) errors.district = "District is required.";
  if (region && district && !isValidDistrict(region, district)) {
    errors.district = "Select a district that belongs to the chosen region.";
  }
  return errors;
}

export function firstError(errors: FieldErrors): string | null {
  const values = Object.values(errors);
  return values.length > 0 ? values[0] : null;
}

export function formatApiError(err: unknown, fallback = "Something went wrong. Please try again."): string {
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}
