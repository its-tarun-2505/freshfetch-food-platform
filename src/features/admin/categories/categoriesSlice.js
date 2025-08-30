import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { createDocument, getCollection, updateDocument, deleteDocument } from '../../../services/firestore';
import { uploadFile, deleteFile as deleteStorageFile } from '../../../services/cloudinaryService';
import { parseFirestoreDocument } from '../../../utils/firestoreUtils';
import { syncCategoriesToPublic } from '../../../services/syncService';

export const fetchCategories = createAsyncThunk(
  'categories/fetchCategories',
  async ({ restaurantId, token }, { rejectWithValue }) => {
    try {
      const response = await getCollection(`restaurants/${restaurantId}/categories`, token);
      return response.map(parseFirestoreDocument);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const addCategory = createAsyncThunk(
  'categories/addCategory',
  async ({ restaurantId, token, name, imageFile }, { rejectWithValue }) => {
    try {
      let imageData = null;
      if (imageFile) {
        imageData = await uploadFile(imageFile);
      }
      
      const newCategory = {
        name: { stringValue: name },
        imageUrl: { stringValue: imageData ? imageData.url : '' },
        imagePublicId: { stringValue: imageData ? imageData.publicId : '' },
        createdAt: { timestampValue: new Date().toISOString() },
      };
      
      console.log('resturantID', restaurantId);
      
      const response = await createDocument(`restaurants/${restaurantId}/categories`, newCategory, token);
      const parsedCategory = parseFirestoreDocument(response);
      
      try {
        await syncCategoriesToPublic(restaurantId, token);
      } catch (syncError) {
        if (syncError.code === 'ALREADY_EXISTS') {
          console.warn('Category already exists in public collection, skipping sync');
        } else {
          console.warn('Failed to sync category to public collection:', syncError);
        }
      }
      
      return parsedCategory;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'categories/updateCategory',
  async ({ restaurantId, token, categoryId, name, imageFile, oldImagePublicId }, { rejectWithValue }) => {
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
      
      const updatedCategory = {
        name: { stringValue: name },
        ...(imageData && {
          imageUrl: { stringValue: imageUrl },
          imagePublicId: { stringValue: imagePublicId },
        }),
        updatedAt: { timestampValue: new Date().toISOString() },
      };
      
      const response = await updateDocument(`restaurants/${restaurantId}/categories/${categoryId}`, updatedCategory, token);
      const parsedCategory = parseFirestoreDocument(response);
      
      try {
        await syncCategoriesToPublic(restaurantId, token);
      } catch (syncError) {
        if (syncError.code === 'ALREADY_EXISTS') {
          console.warn('Category already exists in public collection, skipping sync');
        } else {
          console.warn('Failed to sync category to public collection:', syncError);
        }
      }
      
      return parsedCategory;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'categories/deleteCategory',
  async ({ restaurantId, token, categoryId, imagePublicId }, { rejectWithValue }) => {
    try {
      if (imagePublicId) {
        await deleteStorageFile(imagePublicId);
      }
      await deleteDocument(`restaurants/${restaurantId}/categories/${categoryId}`, token);
      
      try {
        await syncCategoriesToPublic(restaurantId, token);
      } catch (syncError) {
        if (syncError.code === 'ALREADY_EXISTS') {
          console.warn('Category already exists in public collection, skipping sync');
        } else {
          console.warn('Failed to sync category to public collection:', syncError);
        }
      }
      
      return categoryId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState: {
    categories: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(addCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(addCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories.push(action.payload);
      })
      .addCase(addCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(updateCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(updateCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const index = state.categories.findIndex(cat => cat.id === action.payload.id);
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(updateCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(deleteCategory.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.categories = state.categories.filter(cat => cat.id !== action.payload);
      })
      .addCase(deleteCategory.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export default categoriesSlice.reducer;
