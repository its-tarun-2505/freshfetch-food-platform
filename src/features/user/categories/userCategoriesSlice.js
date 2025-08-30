import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPublicCollection } from '../../../services/publicFirestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';

// Fetch all categories for users from a public collection
export const fetchUserCategories = createAsyncThunk(
  'userCategories/fetchUserCategories',
  async () => {
    try {
      // Fetch categories from a public collection that users can access
      // This should be populated by admin operations
      const response = await getPublicCollection('public-categories');
      
      // Parse all categories for users
      const parsedCategories = response
        .map(category => parseFirestoreDocument(category))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return parsedCategories;
    } catch (error) {
      console.error('Error fetching user categories:', error);
      // Return empty array instead of throwing error to prevent app crash
      return [];
    }
  }
);

const userCategoriesSlice = createSlice({
  name: 'userCategories',
  initialState: {
    categories: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearCategories: (state) => {
      state.categories = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload;
        state.error = null;
      })
      .addCase(fetchUserCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearCategories } = userCategoriesSlice.actions;
export default userCategoriesSlice.reducer;
