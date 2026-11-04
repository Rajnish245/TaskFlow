import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, selectAuthLoading, selectAuthError } from '../../features/auth/authSlice';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import styles from './Login.module.css';

/**
 * Login page — email/password form that dispatches loginUser thunk.
 */
export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const loading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    try {
      await dispatch(loginUser(form)).unwrap();
      navigate('/');
    } catch {
      // authError selector will show the message
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo / branding */}
        <div className={styles.brand}>
          <div className={styles.logo}>✦</div>
          <h1 className={styles.appName}>TaskFlow</h1>
          <p className={styles.tagline}>Your Kanban, powered by AI</p>
        </div>

        <h2 className={styles.heading}>Welcome back</h2>

        {/* Server-side error */}
        {authError && <div className={styles.errorBanner}>{authError}</div>}

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <Input
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            error={errors.email}
            autoComplete="email"
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="••••••••"
            error={errors.password}
            autoComplete="current-password"
          />
          <Button type="submit" variant="primary" fullWidth loading={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </Button>
        </form>

        <p className={styles.switchLink}>
          Don&apos;t have an account?{' '}
          <Link to="/register" className={styles.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
