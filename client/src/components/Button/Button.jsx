import React from 'react';
import styles from './Button.module.css';
import Spinner from '../Spinner/Spinner';

/**
 * Reusable Button component.
 *
 * @param {string}   variant   - 'primary' | 'secondary' | 'danger' | 'ghost'
 * @param {string}   size      - 'sm' | 'md' | 'lg'
 * @param {boolean}  loading   - shows inline spinner and disables button
 * @param {boolean}  disabled  - disables button
 * @param {boolean}  fullWidth - stretches button to full container width
 * @param {string}   type      - button type attribute (default 'button')
 * @param {Function} onClick   - click handler
 * @param {React.ReactNode} children - button content
 */
const Button = React.forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    type = 'button',
    onClick,
    children,
    className = '',
    ...rest
  },
  ref
) {
  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={[
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      {...rest}
    >
      {loading && (
        <span className={styles.spinnerWrap}>
          <Spinner size="sm" color="currentColor" />
        </span>
      )}
      <span className={loading ? styles.hiddenText : ''}>{children}</span>
    </button>
  );
});

export default Button;
