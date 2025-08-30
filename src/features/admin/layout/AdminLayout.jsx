import React, { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { clearAdminAuth } from '../auth/authSlice';
import { useNavigate } from 'react-router-dom';
import styles from './AdminLayout.module.css';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(clearAdminAuth());
    navigate('/admin/login');
  };

  return (
    <div className={styles.wrapper}>
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M4 6h16M4 12h16M4 18h16"
          ></path>
        </svg>
      </button>

      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}
      >
        <div>
          <h1 className={styles.logo}>FreshFetch Admin</h1>
          <nav className={styles.nav}>
            <ul>
              <li>
                <Link to="/admin/dashboard" onClick={() => setSidebarOpen(false)}>Dashboard</Link>
              </li>
              <li>
                <Link to="/admin/categories" onClick={() => setSidebarOpen(false)}>Categories</Link>
              </li>
              <li>
                <Link to="/admin/recipes" onClick={() => setSidebarOpen(false)}>Recipes</Link>
              </li>
              <li>
                <Link to="/admin/orders" onClick={() => setSidebarOpen(false)}>Orders</Link>
              </li>
            </ul>
          </nav>
        </div>

        <button onClick={handleLogout} className={styles.logoutBtn}>
          Logout
        </button>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
