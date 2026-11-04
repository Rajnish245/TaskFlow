import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './Navbar.module.css';
import { logout, selectUser } from '../../features/auth/authSlice';
import Button from '../Button/Button';

/**
 * Application navigation bar.
 * Shows logo, user name, and logout action.
 * Collapses to hamburger on mobile.
 */
export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectUser);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    setMenuOpen(false);
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.inner}>
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <span className={styles.logoIcon}>📋</span>
          <span className={styles.logoText}>TaskFlow</span>
        </Link>

        {/* Desktop nav */}
        <nav className={styles.desktopNav}>
          {user && (
            <div className={styles.userArea}>
              <div className={styles.avatar}>
                {user.name ? user.name.charAt(0).toUpperCase() : '?'}
              </div>
              <span className={styles.userName}>{user.name || user.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile hamburger */}
        {user && (
          <button
            className={styles.hamburger}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <span className={[styles.bar, menuOpen ? styles.barOpen1 : ''].join(' ')} />
            <span className={[styles.bar, menuOpen ? styles.barOpen2 : ''].join(' ')} />
            <span className={[styles.bar, menuOpen ? styles.barOpen3 : ''].join(' ')} />
          </button>
        )}
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && user && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileUser}>
            <div className={styles.avatar}>
              {user.name ? user.name.charAt(0).toUpperCase() : '?'}
            </div>
            <span className={styles.userName}>{user.name || user.email}</span>
          </div>
          <Button
            variant="danger"
            size="sm"
            fullWidth
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      )}
    </header>
  );
}
