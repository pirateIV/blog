import { twMerge } from "tailwind-merge";

/**
 * This function is a wrapper around the twMerge function.
 * It is used to merge the classes inside style objects.
 */
export const cx = twMerge;

/**
 * This function does nothing besides helping us to be able to
 * sort the classes inside style objects which is not supported
 * by the Tailwind IntelliSense by default.
 */
export function sortCx<
  T extends Record<
    string,
    | string
    | number
    | Record<string, string | number | Record<string, string | number>>
  >
>(classes: T): T {
  return classes;
}
