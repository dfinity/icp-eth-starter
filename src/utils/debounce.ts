/**
 * Create an async function which only runs once at a time.
 */
export function debounce<Args extends any[], T>(
  fn: (...args: Args) => Promise<T>,
) {
  let active: Promise<T> | undefined;
  return async (...args: Args): Promise<T> => {
    try {
      if (!active) {
        active = fn(...args);
      }
      return await active;
    } finally {
      active = undefined;
    }
  };
}
