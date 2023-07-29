/**
 * Unwrap an optional Candid value.
 */
export function unwrap<T>(optional: [T] | []): T | undefined;
export function unwrap<T, R>(
  optional: [T] | [],
  map: (value: T) => R,
): R | undefined;
export function unwrap<T, R>(
  optional: [T] | [],
  map?: (value: T) => R,
): R | undefined {
  if (optional.length) {
    const value = optional[0];
    return map ? map(value) : (value as any as R);
  }
  return;
}

export function expect<T>(optional: [T] | [], message?: string): T {
  if (optional.length) {
    return optional[0];
  }
  throw new Error(message || 'Received null');
}

/**
 * Map an optional Candid value with the expected return type.
 */
export function mapOptional<T, R>(
  optional: [T] | [],
  map: (value: T) => R,
): [R] | [] {
  return optional.map(map) as [R] | [];
}

/**
 * Wrap an optional Candid value.
 */
export function wrap<T>(value: T | undefined): [T] | [];
export function wrap<T, R>(
  value: T | undefined,
  map: (value: T) => R,
): [R] | [];
export function wrap<T, R>(
  value: T | undefined,
  map?: (value: T) => R,
): [R] | [] {
  return value === undefined ? [] : [(map ? map(value) : value) as R];
}
