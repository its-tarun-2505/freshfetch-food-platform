import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearUserAuth } from '../features/user/auth/userAuthSlice';
import { FiShoppingCart, FiUser, FiLogIn } from 'react-icons/fi';
import styles from './Header.module.css';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const isAuthenticated = useSelector((state) => state.userAuth.isAuthenticated);
  const userName = useSelector((state) => state.userAuth.name);
  const { items } = useSelector((state) => state.cart);

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleLogout = () => {
    dispatch(clearUserAuth());
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link to="/categories" className={styles.logo}>
          FreshFetch
        </Link>

        <div className={styles.rightSection}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search recipes..."
              className={styles.searchInput}
            />
          </div>

          <Link to="/cart" className={styles.cart}>
            <FiShoppingCart className={styles.icon} />
            {cartItemCount > 0 && (
              <span className={styles.cartBadge}>{cartItemCount}</span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className={styles.profileMenu}>
              <button className={styles.profileButton}>
                <FiUser className={styles.icon} />
                <span className={styles.userName}>{userName || 'Profile'}</span>
              </button>
              <div className={styles.dropdown}>
                <Link to="/categories" className={styles.dropdownItem}>Menu</Link>
                <Link to="/orders" className={styles.dropdownItem}>Orders</Link>
                <Link to="/profile" className={styles.dropdownItem}>Profile</Link>
                <button onClick={handleLogout} className={styles.dropdownItem}>Logout</button>
              </div>
            </div>
          ) : (
            <Link to="/login" className={styles.login}>
              <FiLogIn className={styles.icon} />
              <span className={styles.loginText}>Login</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
