import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { signUpAdmin } from '../../../services/firebaseAuth';
import { setAdminAuth } from '../auth/authSlice';
import { FaEnvelope, FaLock, FaUser } from 'react-icons/fa';
import styles from './AuthForms.module.css';

export const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const response = await signUpAdmin(email, password, name);
      dispatch(
        setAdminAuth({
          token: response.idToken,
          adminId: response.localId,
          email: response.email,
          restaurantId: response.localId,
        })
      );
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up.');
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>Admin Sign Up</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="name">
              <FaUser className={styles.icon} /> Restaurant Name
            </label>
            <input
              type="text"
              id="name"
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">
              <FaEnvelope className={styles.icon} /> Email
            </label>
            <input
              type="email"
              id="email"
              className={styles.input}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">
              <FaLock className={styles.icon} /> Password
            </label>
            <input
              type="password"
              id="password"
              className={styles.input}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className={styles.errorMsg}>{error}</p>}

          <div className={styles.actions}>
            <button type="submit" className={styles.signupBtn}>
              Sign Up
            </button>
            <Link to="/admin/login" className={styles.link}>
              Already have an account? Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
export default Signup;
