import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('adminToken') || null,
  isAuthenticated: !!localStorage.getItem('adminToken'),
  adminId: localStorage.getItem('adminId') || null,
  email: localStorage.getItem('adminEmail') || null,
  restaurantId: localStorage.getItem('restaurantId') || null,
};

const authSlice = createSlice({
  name: 'adminAuth',
  initialState,
  reducers: {
    setAdminAuth: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.adminId = action.payload.adminId;
      state.email = action.payload.email;
      state.restaurantId = action.payload.restaurantId;
      localStorage.setItem('adminToken', action.payload.token);
      localStorage.setItem('adminId', action.payload.adminId);
      localStorage.setItem('adminEmail', action.payload.email);
      localStorage.setItem('restaurantId', action.payload.restaurantId);
    },
    clearAdminAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.adminId = null;
      state.email = null;
      state.restaurantId = null;
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminId');
      localStorage.removeItem('adminEmail');
      localStorage.removeItem('restaurantId');
    },
  },
});

export const { setAdminAuth, clearAdminAuth } = authSlice.actions;

export default authSlice.reducer;
