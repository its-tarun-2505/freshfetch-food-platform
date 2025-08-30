import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createDocument, getCollection, updateDocument, deleteDocument } from '../../../services/firestore';
import { uploadFile, deleteFile as deleteStorageFile } from '../../../services/cloudinaryService';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';
import { syncRecipesToPublic } from '../../../services/syncService';

export const fetchRecipes = createAsyncThunk(
  'recipes/fetchRecipes',
  async ({ restaurantId, token, categoryId = null }, { rejectWithValue }) => {
    try {
      let collectionPath = `restaurants/${restaurantId}/recipes`;
      const response = await getCollection(collectionPath, token);
      return response.map(parseFirestoreDocument);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addRecipe = createAsyncThunk(
  'recipes/addRecipe',
  async ({ restaurantId, token, name, categoryId, ingredients, price, imageFile }, { rejectWithValue }) => {
    try {
      let imageData = null;
      if (imageFile) {
        imageData = await uploadFile(imageFile);
      }
      
      const newRecipe = {
        name: { stringValue: name },
        categoryId: { stringValue: categoryId },
        ingredients: { stringValue: ingredients },
        price: { doubleValue: price },
        imageUrl: { stringValue: imageData ? imageData.url : '' },
        imagePublicId: { stringValue: imageData ? imageData.publicId : '' },
        createdAt: { timestampValue: new Date().toISOString() },
      };
      
      const response = await createDocument(`restaurants/${restaurantId}/recipes`, newRecipe, token);
      const parsedRecipe = parseFirestoreDocument(response);
      
      try {
        await syncRecipesToPublic(restaurantId, token);
      } catch (syncError) {
        if (syncError.code === 'ALREADY_EXISTS') {
          console.warn('Recipe already exists in public collection, skipping sync');
        } else {
          console.warn('Failed to sync recipe to public collection:', syncError);
        }
      }
      
      return parsedRecipe;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateRecipe = createAsyncThunk(
  'recipes/updateRecipe',
  async ({ restaurantId, token, recipeId, name, categoryId, ingredients, price, imageFile, oldImagePublicId }, { rejectWithValue }) => {
    try {
      let imageData = null;
      let imageUrl = '';
      let imagePublicId = '';
      
      if (imageFile) {
        if (oldImagePublicId) {
          await deleteStorageFile(oldImagePublicId);
        }
        
        imageData = await uploadFile(imageFile);
        imageUrl = imageData.url;
        imagePublicId = imageData.publicId;
      }
      
      const updatedRecipe = {
        name: { stringValue: name },
        categoryId: { stringValue: categoryId },
        ingredients: { stringValue: ingredients },
        price: { doubleValue: price },
        ...(imageData && {
          imageUrl: { stringValue: imageUrl },
          imagePublicId: { stringValue: imagePublicId },
        }),
        updatedAt: { timestampValue: new Date().toISOString() },
      };
      
      const response = await updateDocument(`restaurants/${restaurantId}/recipes/${recipeId}`, updatedRecipe, token);
      const parsedRecipe = parseFirestoreDocument(response);
      
      try {
        await syncRecipesToPublic(restaurantId, token);
      } catch (syncError) {
        if (syncError.code === 'ALREADY_EXISTS') {
          console.warn('Recipe already exists in public collection, skipping sync');
        } else {
          console.warn('Failed to sync recipe to public collection:', syncError);
        }
      }
      
      return parsedRecipe;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteRecipe = createAsyncThunk(
  'recipes/deleteRecipe',
  async ({ restaurantId, token, recipeId, imagePublicId }, { rejectWithValue }) => {
    try {
      if (imagePublicId) {
        await deleteStorageFile(imagePublicId);
      }
      await deleteDocument(`restaurants/${restaurantId}/recipes/${recipeId}`, token);
      
      try {
        await syncRecipesToPublic(restaurantId, token);
      } catch (syncError) {
        if (syncError.code === 'ALREADY_EXISTS') {
          console.warn('Recipe already exists in public collection, skipping sync');
        } else {
          console.warn('Failed to sync recipe to public collection:', syncError);
        }
      }
      
      return recipeId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const recipesSlice = createSlice({
  name: 'recipes',
  initialState: {
    recipes: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecipes.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecipes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recipes = action.payload;
      })
      .addCase(fetchRecipes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addRecipe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addRecipe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recipes.push(action.payload);
      })
      .addCase(addRecipe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateRecipe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateRecipe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.recipes.findIndex(recipe => recipe.id === action.payload.id);
        if (index !== -1) {
          state.recipes[index] = action.payload;
        }
      })
      .addCase(updateRecipe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteRecipe.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteRecipe.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.recipes = state.recipes.filter(recipe => recipe.id !== action.payload);
      })
      .addCase(deleteRecipe.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default recipesSlice.reducer;
