import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUserCategories } from './userCategoriesSlice';
import styles from './UserCategories.module.css';

const UserCategories = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, loading, error } = useSelector((state) => state.userCategories);

  useEffect(() => {
    dispatch(fetchUserCategories());
  }, [dispatch]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/categories/${categoryId}/recipes`);
  };

  const handleRetry = () => {
    dispatch(fetchUserCategories());
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loaderWrapper}>
          <div className={styles.loader}></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>
          <p>Error loading categories: {error}</p>
          <button onClick={handleRetry} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Browse Categories</h1>

      {categories.length === 0 ? (
        <div className={styles.empty}>
          <p>No categories available at the moment.</p>
        </div>
      ) : (
        <div className={styles.grid}>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={styles.card}
            >
              <div className={styles.imageWrapper}>
                <img
                  src={category.imageUrl}
                  alt={category.name}
                  className={styles.image}
                  onError={(e) => {
                    e.target.src =
                      'https://via.placeholder.com/400x300?text=No+Image';
                  }}
                />
              </div>
              <div className={styles.cardBody}>
                <h3 className={styles.cardTitle}>{category.name}</h3>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserCategories;
