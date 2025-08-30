import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams } from 'react-router-dom';
import { fetchRecipes } from '../recipes/recipesSlice';
import styles from './CategoryRecipes.module.css';
import { FaUtensils } from 'react-icons/fa';

const CategoryRecipes = () => {
  const { categoryId } = useParams();
  const { token, restaurantId } = useSelector((state) => state.adminAuth);
  const { recipes, status, error } = useSelector((state) => state.recipes);
  const dispatch = useDispatch();

  useEffect(() => {
    if (restaurantId && token && categoryId) {
      dispatch(fetchRecipes({ restaurantId, token, categoryId }));
    }
  }, [restaurantId, token, categoryId, dispatch]);

  const filteredRecipes = recipes.filter(recipe => recipe.categoryId === categoryId);

  if (status === 'loading') {
    return <div className={styles.loading}>Loading recipes...</div>;
  }

  if (status === 'failed') {
    return <div className={styles.error}>Error: {error.message || error}</div>;
  }

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.pageTitle}>
        <FaUtensils className={styles.icon} /> Recipes in Category: 
      </h2>

      <div className={styles.grid}>
        {filteredRecipes.length > 0 ? (
          filteredRecipes.map((recipe) => (
            <div key={recipe.id} className={styles.recipeCard}>
              {recipe.imageUrl && (
                <img src={recipe.imageUrl} alt={recipe.name} className={styles.recipeImage} />
              )}
              <div className={styles.recipeContent}>
                <h4 className={styles.recipeName}>{recipe.name}</h4>
                <p className={styles.recipePrice}>Price: ${recipe.price}</p>
              </div>
            </div>
          ))
        ) : (
          <p className={styles.noData}>No recipes found in this category.</p>
        )}
      </div>
    </div>
  );
};

export default CategoryRecipes;
