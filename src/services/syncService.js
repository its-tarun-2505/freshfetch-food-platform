import { getCollection, createDocument, updateDocument, deleteDocument, getDocument } from './firestore';
import { parseFirestoreDocument } from '../utils/firestoreUtils';

let syncLocks = {
  categories: false,
  recipes: false,
  all: false
};

export const syncCategoriesToPublic = async (restaurantId, token) => {
  if (syncLocks.categories) {
    console.warn('Categories sync already in progress, skipping...');
    return true;
  }
  
  syncLocks.categories = true;
  
  try {
    const adminCategories = await getCollection(`restaurants/${restaurantId}/categories`, token);
    
    const parsedCategories = adminCategories.map(category => parseFirestoreDocument(category));
    
    for (const category of parsedCategories) {
      const publicCategoryData = {
        id: { stringValue: category.id },
        name: { stringValue: category.name },
        imageUrl: { stringValue: category.imageUrl || '' },
        imagePublicId: { stringValue: category.imagePublicId || '' },
        restaurantId: { stringValue: restaurantId },
        updatedAt: { timestampValue: new Date().toISOString() }
      };
      
      try {
        try {
          await getDocument(`public-categories/${category.id}`, token);
          await updateDocument(`public-categories/${category.id}`, publicCategoryData, token);
        } catch (notFoundError) {
          await createDocument('public-categories', publicCategoryData, token, category.id);
        }
      } catch (error) {
        console.error(`Error syncing category ${category.id}:`, error);
      }
    }
    
    console.log(`Synced ${parsedCategories.length} categories to public collection`);
    return true;
  } catch (error) {
    console.error('Error syncing categories to public:', error);
    throw error;
  } finally {
    syncLocks.categories = false;
  }
};

export const syncRecipesToPublic = async (restaurantId, token) => {
  if (syncLocks.recipes) {
    console.warn('Recipes sync already in progress, skipping...');
    return true;
  }
  
  syncLocks.recipes = true;
  
  try {
    const adminRecipes = await getCollection(`restaurants/${restaurantId}/recipes`, token);
    
    const parsedRecipes = adminRecipes.map(recipe => parseFirestoreDocument(recipe));
    
    for (const recipe of parsedRecipes) {
      const publicRecipeData = {
        id: { stringValue: recipe.id },
        name: { stringValue: recipe.name },
        categoryId: { stringValue: recipe.categoryId || '' },
        ingredients: { stringValue: recipe.ingredients || '' },
        price: { doubleValue: recipe.price || 0 },
        imageUrl: { stringValue: recipe.imageUrl || '' },
        imagePublicId: { stringValue: recipe.imagePublicId || '' },
        restaurantId: { stringValue: restaurantId },
        updatedAt: { timestampValue: new Date().toISOString() }
      };
      
      try {
        try {
          await getDocument(`public-recipes/${recipe.id}`, token);
          await updateDocument(`public-recipes/${recipe.id}`, publicRecipeData, token);
        } catch (notFoundError) {
          await createDocument('public-recipes', publicRecipeData, token, recipe.id);
        }
      } catch (error) {
        console.error(`Error syncing recipe ${recipe.id}:`, error);
      }
    }
    
    console.log(`Synced ${parsedRecipes.length} recipes to public collection`);
    return true;
  } catch (error) {
    console.error('Error syncing recipes to public:', error);
    throw error;
  } finally {
    syncLocks.recipes = false;
  }
};

export const syncAllToPublic = async (restaurantId, token) => {
  if (syncLocks.all) {
    console.warn('Full sync already in progress, skipping...');
    return true;
  }
  
  syncLocks.all = true;
  
  try {
    await syncCategoriesToPublic(restaurantId, token);
    await syncRecipesToPublic(restaurantId, token);
    console.log('Successfully synced all data to public collections');
    return true;
  } catch (error) {
    console.error('Error syncing all data to public:', error);
    throw error;
  } finally {
    syncLocks.all = false;
  }
};

export const getSyncStatus = () => {
  return { ...syncLocks };
};
