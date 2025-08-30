import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { validateToken } from './services/firebaseAuth';
import { setAdminAuth, clearAdminAuth } from './features/admin/auth/authSlice';
import { setUserAuth, clearUserAuth } from './features/user/auth/userAuthSlice';

import AdminLogin from './features/admin/auth/Login'; 
import AdminSignup from './features/admin/auth/Signup'; 
import AdminLayout from './features/admin/layout/AdminLayout';
import Dashboard from './features/admin/dashboard/Dashboard';
import Categories from './features/admin/categories/Categories';
import CategoryRecipes from './features/admin/categories/CategoryRecipes';
import Recipes from './features/admin/recipes/Recipes';
import Orders from './features/admin/orders/Orders';
import AdminProtectedRoute from './components/ProtectedRoute'; 

import UserLogin from './features/user/auth/UserLogin';
import UserSignup from './features/user/auth/UserSignup';
import Profile from './features/user/profile/Profile';
import UserProtectedRoute from './components/UserProtectedRoute';
import UserLayout from './components/UserLayout';
import UserCategories from './features/user/categories/UserCategories';
import UserCategoryRecipes from './features/user/categories/CategoryRecipes';
import Cart from './features/user/cart/Cart';
import Checkout from './features/user/checkout/Checkout';
import UserOrders from './features/user/orders/UserOrders';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    
    const checkAdminAuth = async () => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        try {
          const response = await validateToken(token);
          const adminId = localStorage.getItem('adminId');
          const email = localStorage.getItem('adminEmail');
          const restaurantId = localStorage.getItem('restaurantId');
          dispatch(setAdminAuth({ token, adminId, email, restaurantId }));
        } catch (error) {
          console.error("Admin token validation failed:", error);
          dispatch(clearAdminAuth());
        }
      } else {
        dispatch(clearAdminAuth());
      }
    };
    checkAdminAuth();

    
    const checkUserAuth = async () => {
      const token = localStorage.getItem('userToken');
      if (token) {
        try {
          const response = await validateToken(token);
          const userId = localStorage.getItem('userId');
          const email = localStorage.getItem('userEmail');
          const name = localStorage.getItem('userName');
          const address = localStorage.getItem('userAddress');
          dispatch(setUserAuth({ token, userId, email, name, address }));
        } catch (error) {
          console.error("User token validation failed:", error);
          dispatch(clearUserAuth());
        }
      } else {
        dispatch(clearUserAuth());
      }
    };
    checkUserAuth();
  }, [dispatch]);

  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/signup" element={<AdminSignup />} />

      <Route path="/admin" element={<AdminProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="categories" element={<Categories />} />
          <Route path="categories/:categoryId/recipes" element={<CategoryRecipes />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="orders" element={<Orders />} />
        </Route>
      </Route>

      {/* User Routes */}
      <Route path="/login" element={<UserLogin />} />
      <Route path="/signup" element={<UserSignup />} />

      <Route path="/" element={<UserLayout />}>
        <Route index element={<UserCategories />} />
        <Route path="categories" element={<UserCategories />} />
        <Route path="categories/:categoryId/recipes" element={<UserCategoryRecipes />} />
        <Route path="cart" element={<Cart />} />
        <Route path="checkout" element={<Checkout />} />
        <Route path="orders" element={<UserProtectedRoute />}>
          <Route index element={<UserOrders />} />
        </Route>
        <Route path="profile" element={<UserProtectedRoute />}>
          <Route index element={<Profile />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
