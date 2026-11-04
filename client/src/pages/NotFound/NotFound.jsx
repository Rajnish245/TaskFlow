import React from 'react';
import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

/**
 * NotFound — 404 page displayed when a route doesn't match.
 */
export default function NotFound() {
  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.code}>404</div>
        <h1 className={styles.title}>Page not found</h1>
        <p className={styles.message}>
          Oops! The page you&apos;re looking for doesn&apos;t exist or was moved.
        </p>
        <Link to="/" className={styles.homeLink}>
          ← Back to Dashboard
        </Link>
      </div>
    </div>
  );
}
