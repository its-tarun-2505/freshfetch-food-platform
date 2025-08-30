import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  token: localStorage.getItem('userToken') || null,
  isAuthenticated: !!localStorage.getItem('userToken'),
  userId: localStorage.getItem('userId') || null,
  email: localStorage.getItem('userEmail') || null,
  name: localStorage.getItem('userName') || null,
  address: localStorage.getItem('userAddress') || null,
};

const userAuthSlice = createSlice({
  name: 'userAuth',
  initialState,
  reducers: {
    setUserAuth: (state, action) => {
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.userId = action.payload.userId;
      state.email = action.payload.email;
      state.name = action.payload.name || null;
      state.address = action.payload.address || null;
      localStorage.setItem('userToken', action.payload.token);
      localStorage.setItem('userId', action.payload.userId);
      localStorage.setItem('userEmail', action.payload.email);
      if (action.payload.name) localStorage.setItem('userName', action.payload.name);
      if (action.payload.address) localStorage.setItem('userAddress', action.payload.address);
    },
    clearUserAuth: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      state.userId = null;
      state.email = null;
      state.name = null;
      state.address = null;
      localStorage.removeItem('userToken');
      localStorage.removeItem('userId');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userName');
      localStorage.removeItem('userAddress');
    },
    updateUserProfile: (state, action) => {
      state.name = action.payload.name;
      state.address = action.payload.address;
      localStorage.setItem('userName', action.payload.name);
      localStorage.setItem('userAddress', action.payload.address);
    },
  },
});

export const { setUserAuth, clearUserAuth, updateUserProfile } = userAuthSlice.actions;

export default userAuthSlice.reducer;
