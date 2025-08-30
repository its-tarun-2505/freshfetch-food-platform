import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addCategory, fetchCategories, updateCategory, deleteCategory } from './categoriesSlice';
import { validateName, validateImage } from '../../../utils/validation';
import LoadingSpinner from '../../../components/LoadingSpinner';
import styles from './Categories.module.css';
import { FaEye, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';

const Categories = () => {
  const [categoryName, setCategoryName] = useState('');
  const [categoryImage, setCategoryImage] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [editCategoryName, setEditCategoryName] = useState('');
  const [editCategoryImage, setEditCategoryImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [editErrors, setEditErrors] = useState({});

  const { token, restaurantId } = useSelector((state) => state.adminAuth);
  const { status, error, categories } = useSelector((state) => state.categories);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (restaurantId && token) {
      dispatch(fetchCategories({ restaurantId, token }));
    }
  }, [restaurantId, token, dispatch]);

  const validateForm = () => {
    const newErrors = {};
    const nameError = validateName(categoryName);
    if (nameError) newErrors.name = nameError;

    const imageError = validateImage(categoryImage);
    if (imageError) newErrors.image = imageError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateEditForm = () => {
    const newErrors = {};
    const nameError = validateName(editCategoryName);
    if (nameError) newErrors.name = nameError;

    if (editCategoryImage) {
      const imageError = validateImage(editCategoryImage);
      if (imageError) newErrors.image = imageError;
    }

    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    if (categoryName && categoryImage && restaurantId && token) {
      dispatch(addCategory({ restaurantId, token, name: categoryName, imageFile: categoryImage }));
      setCategoryName('');
      setCategoryImage(null);
      setErrors({});
    }
  };

  const handleEditClick = (category) => {
    setEditingCategory(category);
    setEditCategoryName(category.name);
    setEditCategoryImage(null);
    setEditErrors({});
  };

  const handleUpdateCategory = (e) => {
    e.preventDefault();
    if (!validateEditForm()) return;

    if (editingCategory && editCategoryName && restaurantId && token) {
      dispatch(updateCategory({
        restaurantId,
        token,
        categoryId: editingCategory.id,
        name: editCategoryName,
        imageFile: editCategoryImage,
        oldImagePublicId: editingCategory.imagePublicId,
      }));
      setEditingCategory(null);
      setEditCategoryName('');
      setEditCategoryImage(null);
      setEditErrors({});
    }
  };

  const handleDeleteCategory = (categoryId, imagePublicId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      dispatch(deleteCategory({ restaurantId, token, categoryId, imagePublicId }));
    }
  };

  const handleCategoryClick = (categoryId) => {
    navigate(`/admin/categories/${categoryId}/recipes`);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setEditCategoryName('');
    setEditCategoryImage(null);
    setEditErrors({});
  };

  if (status === 'loading') {
    return (
      <div className={styles.pageWrapper}>
        <LoadingSpinner size="xl" text="Loading categories..." />
      </div>
    );
  }

  return (
    <div className={styles.pageWrapper}>
      <h2 className={styles.pageTitle}>Categories Management</h2>

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Add New Category</h3>
        <form onSubmit={handleAddCategory} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="categoryName" className={styles.label}>Category Name</label>
            <input
              type="text"
              id="categoryName"
              className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              required
            />
            {errors.name && <p className={styles.errorText}>{errors.name}</p>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="categoryImage" className={styles.label}>Category Image</label>
            <input
              type="file"
              id="categoryImage"
              className={`${styles.fileInput} ${errors.image ? styles.inputError : ''}`}
              onChange={(e) => setCategoryImage(e.target.files[0])}
              required
            />
            {errors.image && <p className={styles.errorText}>{errors.image}</p>}
          </div>

          <button type="submit" className={styles.addBtn} disabled={status === 'loading'}>
            <FaPlus className={styles.icon} /> {status === 'loading' ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {error && <div className={styles.errorBox}><strong>Error:</strong> {error}</div>}

      <div className={styles.card}>
        <h3 className={styles.cardTitle}>Existing Categories</h3>
        {categories.length === 0 ? (
          <p className={styles.noData}>No categories found. Add your first category above.</p>
        ) : (
          <div className={styles.grid}>
            {categories.map((category) => (
              <div key={category.id} className={styles.categoryCard}>
                <img
                  src={category.imageUrl || 'https://via.placeholder.com/200x150?text=No+Image'}
                  alt={category.name}
                  className={styles.categoryImage}
                />
                <h4 className={styles.categoryName}>{category.name}</h4>
                <div className={styles.actions}>
                  <button onClick={() => handleCategoryClick(category.id)} className={styles.viewBtn}>
                    <FaEye /> View Recipes
                  </button>
                  <button onClick={() => handleEditClick(category)} className={styles.editBtn}>
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDeleteCategory(category.id, category.imagePublicId)} className={styles.deleteBtn}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingCategory && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3 className={styles.modalTitle}>Edit Category</h3>
            <form onSubmit={handleUpdateCategory} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="editCategoryName" className={styles.label}>Category Name</label>
                <input
                  type="text"
                  id="editCategoryName"
                  className={`${styles.input} ${editErrors.name ? styles.inputError : ''}`}
                  value={editCategoryName}
                  onChange={(e) => setEditCategoryName(e.target.value)}
                  required
                />
                {editErrors.name && <p className={styles.errorText}>{editErrors.name}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="editCategoryImage" className={styles.label}>New Image (Optional)</label>
                <input
                  type="file"
                  id="editCategoryImage"
                  className={`${styles.fileInput} ${editErrors.image ? styles.inputError : ''}`}
                  onChange={(e) => setEditCategoryImage(e.target.files[0])}
                />
                {editErrors.image && <p className={styles.errorText}>{editErrors.image}</p>}
              </div>

              <div className={styles.modalActions}>
                <button type="submit" className={styles.updateBtn}>Update Category</button>
                <button type="button" onClick={handleCancelEdit} className={styles.cancelBtn}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
