import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, sendPasswordResetEmail } from '../../../services/firebaseAuth';
import { setUserAuth } from '../auth/userAuthSlice';
import { getDocument } from '../../../services/firestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';
import styles from './Auth.module.css';

const UserLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    try {
      const response = await loginUser(email, password);
      const { idToken, localId } = response;

      const userDoc = await getDocument(`users/${localId}`, idToken);
      const parsedUser = parseFirestoreDocument(userDoc);

      dispatch(setUserAuth({
        token: idToken,
        userId: localId,
        email: parsedUser.email,
        name: parsedUser.name,
        address: parsedUser.address,
      }));
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed to login.');
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email to reset password.');
      return;
    }
    try {
      await sendPasswordResetEmail(email);
      setMessage('Password reset email sent. Please check your inbox.');
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to send password reset email.');
      setMessage(null);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h2 className={styles.title}>User Login</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="email">Email</label>
            <input 
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="password">Password</label>
            <input 
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}
          {message && <p className={styles.success}>{message}</p>}

          <div className={styles.actions}>
            <button type="submit" className={`${styles.btn} ${styles.loginBtn}`}>
              Sign In
            </button>
            <Link to="/signup" className={styles.link}>
              Don't have an account? Sign Up
            </Link>
          </div>

          <div className={styles.extra}>
            <button type="button" onClick={handleForgotPassword} className={styles.link}>
              Forgot Password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserLogin;
