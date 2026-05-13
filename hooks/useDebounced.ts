import { useEffect, useState } from "react";

/**
 * Returns a debounced version of a value that only updates after `delay` ms
 * has passed since the last change. Use to avoid running expensive work
 * (filtering, network calls) on every keystroke.
 */
export function useDebounced<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}
