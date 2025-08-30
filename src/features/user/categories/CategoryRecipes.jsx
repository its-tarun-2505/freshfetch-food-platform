import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchUserRecipes } from '../recipes/userRecipesSlice';
import { fetchUserCategories } from './userCategoriesSlice';
import { addToCart } from '../cart/cartSlice';
import styles from './CategoryRecipes.module.css';

const CategoryRecipes = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categoryId } = useParams();
  const { recipes, loading, error } = useSelector((state) => state.userRecipes);
  const { categories } = useSelector((state) => state.userCategories);

  useEffect(() => {
    dispatch(fetchUserRecipes());
    dispatch(fetchUserCategories());
  }, [dispatch]);

  const category = categories.find(cat => cat.id === categoryId);

  const categoryRecipes = recipes.filter(recipe => {
    const recipeCategoryId = recipe.categoryId;
    return (
      recipeCategoryId === categoryId ||
      recipeCategoryId === String(categoryId) ||
      String(recipeCategoryId) === categoryId
    );
  });

  const handleAddToCart = (recipe) => {
    dispatch(addToCart({
      id: recipe.id,
      name: recipe.name,
      price: recipe.price,
      image: recipe.imageUrl,
      categoryId: recipe.categoryId,
      restaurantId: recipe.restaurantId || 'default-restaurant',
    }));
  };

  const handleBackToCategories = () => {
    navigate('/categories');
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <p className={styles.error}>Error loading recipes: {error}</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleBackToCategories} className={styles.backBtn}>
          ← Back to Categories
        </button>
        <h1 className={styles.title}>
          {category ? category.name : 'Category'} Recipes
        </h1>
        {categoryRecipes.length === 0 && (
          <p className={styles.noRecipes}>No recipes available in this category.</p>
        )}
      </div>

      <div className={styles.grid}>
        {categoryRecipes.map((recipe) => (
          <div key={recipe.id} className={styles.card}>
            <div className={styles.imageWrapper}>
              <img
                src={recipe.imageUrl}
                alt={recipe.name}
                className={styles.image}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/400x300?text=No+Image';
                }}
              />
            </div>
            <div className={styles.cardContent}>
              <h3 className={styles.recipeName}>{recipe.name}</h3>
              <p className={styles.ingredients}>{recipe.ingredients}</p>
              <div className={styles.cardFooter}>
                <span className={styles.price}>${recipe.price}</span>
                <button
                  onClick={() => handleAddToCart(recipe)}
                  className={styles.addBtn}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryRecipes;
