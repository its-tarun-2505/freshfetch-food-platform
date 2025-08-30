import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { addRecipe, fetchRecipes, deleteRecipe, updateRecipe } from './recipesSlice';
import { fetchCategories } from '../categories/categoriesSlice';import styles from './Recipes.module.css';
import { FaPlusCircle, FaEdit, FaTrashAlt } from 'react-icons/fa';

const Recipes = () => {
  const [recipeName, setRecipeName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [price, setPrice] = useState('');
  const [recipeImage, setRecipeImage] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [editRecipeName, setEditRecipeName] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editIngredients, setEditIngredients] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editRecipeImage, setEditRecipeImage] = useState(null);

  const { token, restaurantId } = useSelector((state) => state.adminAuth);
  const { recipes, status: recipesStatus, error: recipesError } = useSelector((state) => state.recipes);
  const { categories, status: categoriesStatus, error: categoriesError } = useSelector((state) => state.categories);
  const dispatch = useDispatch();

  useEffect(() => {
    if (restaurantId && token) {
      dispatch(fetchRecipes({ restaurantId, token }));
      dispatch(fetchCategories({ restaurantId, token }));
    }
  }, [restaurantId, token, dispatch]);

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    if (recipeName && categoryId && ingredients && price && recipeImage && restaurantId && token) {
      dispatch(addRecipe({
        restaurantId,
        token,
        name: recipeName,
        categoryId,
        ingredients,
        price: parseFloat(price),
        imageFile: recipeImage,
      }));
      setRecipeName('');
      setCategoryId('');
      setIngredients('');
      setPrice('');
      setRecipeImage(null);
    }
  };

  const handleEditClick = (recipe) => {
    setEditingRecipe(recipe);
    setEditRecipeName(recipe.name);
    setEditCategoryId(recipe.categoryId);
    setEditIngredients(recipe.ingredients);
    setEditPrice(recipe.price.toString());
    setEditRecipeImage(null);
  };

  const handleUpdateRecipe = async (e) => {
    e.preventDefault();
    if (editingRecipe && editRecipeName && editCategoryId && editIngredients && editPrice && restaurantId && token) {
      dispatch(updateRecipe({
        restaurantId,
        token,
        recipeId: editingRecipe.id,
        name: editRecipeName,
        categoryId: editCategoryId,
        ingredients: editIngredients,
        price: parseFloat(editPrice),
        imageFile: editRecipeImage,
        oldImagePublicId: editingRecipe.imagePublicId,
      }));
      setEditingRecipe(null);
      setEditRecipeName('');
      setEditCategoryId('');
      setEditIngredients('');
      setEditPrice('');
      setEditRecipeImage(null);
    }
  };

  const handleDeleteRecipe = (recipeId, imagePublicId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      dispatch(deleteRecipe({ restaurantId, token, recipeId, imagePublicId }));
    }
  };

  const isLoading = recipesStatus === 'loading' || categoriesStatus === 'loading';
  const hasError = recipesError || categoriesError;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Recipes Management</h2>

      <div className={styles.cardSection}>
        <h3 className={styles.formHeading}>Add New Recipe</h3>
        <form onSubmit={handleAddRecipe}>
          <div className={styles.formControl}>
            <label htmlFor="recipeName" className={styles.label}>Recipe Name</label>
            <input
              type="text"
              id="recipeName"
              className={styles.input}
              value={recipeName}
              onChange={(e) => setRecipeName(e.target.value)}
              required
            />
          </div>
          <div className={styles.formControl}>
            <label htmlFor="categorySelect" className={styles.label}>Category</label>
            <select
              id="categorySelect"
              className={styles.select}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {categoriesStatus === 'loading' && <p className={styles.statusMsg}>Loading categories...</p>}
            {categoriesError && <p className={styles.errorMsg}>Error loading categories: {categoriesError.message || categoriesError}</p>}
          </div>
          <div className={styles.formControl}>
            <label htmlFor="ingredients" className={styles.label}>Ingredients (comma-separated)</label>
            <textarea
              id="ingredients"
              className={styles.textarea}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              rows="3"
              required
            ></textarea>
          </div>
          <div className={styles.formControl}>
            <label htmlFor="price" className={styles.label}>Price</label>
            <input
              type="number"
              id="price"
              step="0.01"
              className={styles.input}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              required
            />
          </div>
          <div className={styles.formControl}>
            <label htmlFor="recipeImage" className={styles.label}>Recipe Image</label>
            <input
              type="file"
              id="recipeImage"
              className={styles.fileInput}
              onChange={(e) => setRecipeImage(e.target.files[0])}
              required
            />
          </div>
          <button
            type="submit"
            className={styles.button}
            disabled={isLoading}
          >
            <FaPlusCircle /> Add Recipe
          </button>
        </form>
        {recipesStatus === 'loading' && <p className={styles.statusMsg}>Adding recipe...</p>}
        {hasError && <p className={styles.errorMsg}>Error: {recipesError?.message || recipesError || categoriesError?.message || categoriesError}</p>}
      </div>

      {editingRecipe && (
        <div className={styles.cardSection}>
          <h3 className={styles.formHeading}>Edit Recipe</h3>
          <form onSubmit={handleUpdateRecipe}>
            <div className={styles.formControl}>
              <label htmlFor="editRecipeName" className={styles.label}>Recipe Name</label>
              <input
                type="text"
                id="editRecipeName"
                className={styles.input}
                value={editRecipeName}
                onChange={(e) => setEditRecipeName(e.target.value)}
                required
              />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="editCategorySelect" className={styles.label}>Category</label>
              <select
                id="editCategorySelect"
                className={styles.select}
                value={editCategoryId}
                onChange={(e) => setEditCategoryId(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className={styles.formControl}>
              <label htmlFor="editIngredients" className={styles.label}>Ingredients (comma-separated)</label>
              <textarea
                id="editIngredients"
                className={styles.textarea}
                value={editIngredients}
                onChange={(e) => setEditIngredients(e.target.value)}
                rows="3"
                required
              ></textarea>
            </div>
            <div className={styles.formControl}>
              <label htmlFor="editPrice" className={styles.label}>Price</label>
              <input
                type="number"
                id="editPrice"
                step="0.01"
                className={styles.input}
                value={editPrice}
                onChange={(e) => setEditPrice(e.target.value)}
                required
              />
            </div>
            <div className={styles.formControl}>
              <label htmlFor="editRecipeImage" className={styles.label}>New Image (Optional)</label>
              <input
                type="file"
                id="editRecipeImage"
                className={styles.fileInput}
                onChange={(e) => setEditRecipeImage(e.target.files[0])}
              />
            </div>
            <div className={styles.buttonRow}>
              <button
                type="button"
                onClick={() => setEditingRecipe(null)}
                className={styles.cancelButton}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.button}
                disabled={isLoading}
              >
                <FaEdit /> Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      <h3 className={styles.formHeading}>Existing Recipes</h3>
      {isLoading && <p className={styles.statusMsg}>Loading recipes...</p>}
      {hasError && <p className={styles.errorMsg}>Error: {recipesError?.message || recipesError || categoriesError?.message || categoriesError}</p>}
      <div className={styles.recipeGrid}>
        {recipes.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe.id} className={styles.recipeCard}>
              {recipe.imageUrl && (
                <img src={recipe.imageUrl} alt={recipe.name} className={styles.recipeImg} />
              )}
              <div className={styles.recipeContent}>
                <h4 className={styles.recipeTitle}>{recipe.name}</h4>
                <p className={styles.recipeMeta}>Category: {categories.find(cat => cat.id === recipe.categoryId)?.name}</p>
                <p className={styles.recipeMeta}>Price: ${recipe.price}</p>
                <div className={styles.actionBtns}>
                  <button
                    onClick={() => handleEditClick(recipe)}
                    className={styles.editBtn}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteRecipe(recipe.id, recipe.imagePublicId)}
                    className={styles.deleteBtn}
                  >
                    <FaTrashAlt /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : ( !isLoading &&
          <p className={styles.noRecipes}>No recipes found.</p>
        )}
      </div>
    </div>
  );
};

export default Recipes;
