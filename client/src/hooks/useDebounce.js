import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 *
 * @param {any} value - The value to debounce.
 * @param {number} delay - Milliseconds to delay (default 300ms).
 * @returns {any} The debounced value.
 */
function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(timer);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
