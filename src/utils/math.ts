import _dev from "../dev";

export function rand(min: number, max: number, decimal: number = 0): number {
  if (__DEV__) {
    if (min > max) {
      _dev.warn(
        "fastjs/utils/rand",
        "min is greater than max, this may cause unexpected results",
        [`*min: ${min}`, `*max: ${max}`, `decimal: ${decimal}`]
      );
    }
    if (decimal < 0) {
      _dev.warn(
        "fastjs/utils/rand",
        "decimal is less than 0, this may cause unexpected results",
        [`min: ${min}`, `max: ${max}`, `*decimal: ${decimal}`]
      );
    }
  }

  const prefix = (decimal * 10) || 1;
  [min, max] = [min * prefix, max * prefix];
  let num =
    (Math.floor(Math.pow(10, 14) * Math.random() * Math.random()) %
      (max - min + 1)) +
    min;
  return num / prefix;
}