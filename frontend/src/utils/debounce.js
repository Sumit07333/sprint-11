/**
 * Generic debounce utility function
 * @param {Function} func Function to execute after delay
 * @param {number} delay Delay in milliseconds (Sprint required: 500ms)
 * @returns {Function} Debounced function with cancel method
 */
export function debounce(func, delay = 500) {
  let timeoutId = null;

  const debounced = function (...args) {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      func.apply(this, args);
      timeoutId = null;
    }, delay);
  };

  debounced.cancel = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}
