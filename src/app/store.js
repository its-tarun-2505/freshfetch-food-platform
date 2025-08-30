import { configureStore } from '@reduxjs/toolkit';
import adminAuthReducer from '../features/admin/auth/authSlice';
import categoriesReducer from '../features/admin/categories/categoriesSlice';
import recipesReducer from '../features/admin/recipes/recipesSlice';
import ordersReducer from '../features/admin/orders/ordersSlice';
import userAuthReducer from '../features/user/auth/userAuthSlice';
import cartReducer from '../features/user/cart/cartSlice';
import userOrdersReducer from '../features/user/orders/userOrdersSlice';
import userCategoriesReducer from '../features/user/categories/userCategoriesSlice';
import userRecipesReducer from '../features/user/recipes/userRecipesSlice';

export const store = configureStore({
  reducer: {
    adminAuth: adminAuthReducer,
    categories: categoriesReducer,
    recipes: recipesReducer,
    orders: ordersReducer,
    userAuth: userAuthReducer,
    cart: cartReducer,
    userOrders: userOrdersReducer,
    userCategories: userCategoriesReducer,
    userRecipes: userRecipesReducer,
  },
});
