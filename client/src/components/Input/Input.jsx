import React, { forwardRef } from 'react';
import styles from './Input.module.css';

/**
 * Reusable Input component with label, error, and optional icon.
 *
 * @param {string}          label   - Accessible label text
 * @param {string}          error   - Error message to display below the input
 * @param {React.ReactNode} icon    - Icon element placed inside the input (left side)
 * @param {string}          type    - HTML input type (default 'text')
 * @param {string}          id      - Used to link label and input (auto-generated if not provided)
 */
const Input = forwardRef(function Input(
  { label, error, icon, type = 'text', id, className = '', ...rest },
  ref
) {
  // Generate a unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).slice(2, 9)}`;

  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      {label && (
        <label htmlFor={inputId} className={styles.label}>
          {label}
        </label>
      )}
      <div className={styles.inputWrap}>
        {icon && <span className={styles.icon}>{icon}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={[
            styles.input,
            icon ? styles.withIcon : '',
            error ? styles.inputError : '',
          ]
            .filter(Boolean)
            .join(' ')}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
      </div>
      {error && (
        <p id={`${inputId}-error`} className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
