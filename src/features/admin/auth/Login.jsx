import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginAdmin } from '../../../services/firebaseAuth';
import { setAdminAuth } from '../auth/authSlice';
import { validateEmail, validatePassword } from '../../../utils/validation';
import { FaEnvelope, FaLock} from 'react-icons/fa';
import styles from './AuthForms.module.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    const emailError = validateEmail(email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validatePassword(password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({});
    try {
      const response = await loginAdmin(email, password);
      dispatch(
        setAdminAuth({
          token: response.idToken,
          adminId: response.localId,
          email: response.email,
          restaurantId: response.restaurantId || response.localId,
        })
      );
      navigate('/admin/dashboard');
    } catch (err) {
      if (err.code === 'EMAIL_NOT_FOUND') {
        setErrors({ general: 'No account found with this email address.' });
      } else if (err.code === 'INVALID_PASSWORD') {
        setErrors({ general: 'Invalid password. Please try again.' });
      } else if (err.code === 'TOO_MANY_ATTEMPTS_TRY_LATER') {
        setErrors({ general: 'Too many failed attempts. Please try again later.' });
      } else {
        setErrors({ general: err.message || 'Failed to login. Please try again.' });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Admin Login</h2>

        {errors.general && <div className={styles.errorBox}>{errors.general}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FaEnvelope className={styles.icon} /> Email
            </label>
            <input
              type="email"
              id="email"
              className={`${styles.input} ${errors.email ? styles.errorInput : ''}`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                const emailError = validateEmail(email);
                setErrors((prev) => ({ ...prev, email: emailError }));
              }}
              required
            />
            {errors.email && <p className={styles.errorMsg}>{errors.email}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FaLock className={styles.icon} /> Password
            </label>
            <input
              type="password"
              id="password"
              className={`${styles.input} ${errors.password ? styles.errorInput : ''}`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                const passwordError = validatePassword(password);
                setErrors((prev) => ({ ...prev, password: passwordError }));
              }}
              required
            />
            {errors.password && <p className={styles.errorMsg}>{errors.password}</p>}
          </div>

          <div className={styles.actions}>
            <button type="submit" disabled={isLoading} className={styles.loginBtn}>
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
            <Link to="/admin/signup" className={styles.link}>
              Don&apos;t have an account? Sign Up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
