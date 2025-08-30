import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getPublicCollection } from '../../../services/publicFirestore';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';

export const fetchUserRecipes = createAsyncThunk(
  'userRecipes/fetchUserRecipes',
  async () => {
    try {
      const response = await getPublicCollection('public-recipes');
     
      const parsedRecipes = response
        .map(recipe => parseFirestoreDocument(recipe))
        .sort((a, b) => a.name.localeCompare(b.name));
      
      return parsedRecipes;
    } catch (error) {
      console.error('Error fetching user recipes:', error);
      return [];
    }
  }
);

const userRecipesSlice = createSlice({
  name: 'userRecipes',
  initialState: {
    recipes: [],
    loading: false,
    error: null,
  },
  reducers: {
    clearRecipes: (state) => {
      state.recipes = [];
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserRecipes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserRecipes.fulfilled, (state, action) => {
        state.loading = false;
        state.recipes = action.payload;
        state.error = null;
      })
      .addCase(fetchUserRecipes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export const { clearRecipes } = userRecipesSlice.actions;
export default userRecipesSlice.reducer;
