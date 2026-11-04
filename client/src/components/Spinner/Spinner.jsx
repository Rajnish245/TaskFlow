import React from 'react';
import styles from './Spinner.module.css';

/**
 * SVG spinning circle indicator.
 *
 * @param {string} size  - 'sm' | 'md' | 'lg'
 * @param {string} color - Any CSS color string (default: var(--primary))
 */
export default function Spinner({ size = 'md', color }) {
  const dim = size === 'sm' ? 18 : size === 'lg' ? 48 : 32;

  return (
    <svg
      className={styles.spinner}
      width={dim}
      height={dim}
      viewBox="0 0 50 50"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Loading"
      role="status"
    >
      <circle
        className={styles.track}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="4"
      />
      <circle
        className={styles.arc}
        cx="25"
        cy="25"
        r="20"
        fill="none"
        strokeWidth="4"
        strokeLinecap="round"
        style={{ stroke: color || 'var(--primary)' }}
      />
    </svg>
  );
}
