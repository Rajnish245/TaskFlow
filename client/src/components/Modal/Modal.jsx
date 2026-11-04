import React, { useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom';
import styles from './Modal.module.css';
import Button from '../Button/Button';

/**
 * Portal-based modal with:
 *  - Backdrop click to close
 *  - Escape key to close
 *  - Focus trap
 *  - Fade + scale animation
 *
 * @param {boolean}         isOpen  - Controls visibility
 * @param {Function}        onClose - Called when modal should close
 * @param {string}          title   - Modal header title
 * @param {React.ReactNode} children
 * @param {string}          size    - 'sm' | 'md' | 'lg'
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  // ── Close on Escape key ──────────────────────────────────────────────────
  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose();

      // Basic focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last?.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first?.focus();
          }
        }
      }
    },
    [onClose]
  );

  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement;
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Focus the modal after mount
      setTimeout(() => modalRef.current?.focus(), 0);
    } else {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      previousFocusRef.current?.focus();
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        ref={modalRef}
        className={[styles.modal, styles[size]].join(' ')}
        tabIndex={-1}
      >
        {/* Header */}
        <div className={styles.header}>
          <h2 id="modal-title" className={styles.title}>
            {title}
          </h2>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close modal"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>{children}</div>
      </div>
    </div>,
    document.body
  );
}
