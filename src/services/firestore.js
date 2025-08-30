import axios from 'axios';
import firebaseConfig from '../firebaseConfig';

const PROJECT_ID = firebaseConfig.projectId;
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, 
  backoffMultiplier: 2
};

const retryOperation = async (operation, retries = RETRY_CONFIG.maxRetries) => {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && (error.code === 'UNAVAILABLE' || error.code === 'DEADLINE_EXCEEDED')) {
      console.warn(`Operation failed, retrying... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, RETRY_CONFIG.retryDelay));
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

export const getCollection = async (collectionPath, token) => {
  try {
    const response = await axios.get(`${FIRESTORE_BASE_URL}/${collectionPath}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data.documents || [];
  } catch (error) {
    console.error("Error fetching collection:", error.response || error);
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export const getDocument = async (docPath, token) => {
  try {
    const response = await axios.get(`${FIRESTORE_BASE_URL}/${docPath}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching document:", error.response || error);
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export const createDocument = async (collection, data, token, docId) => {  
  try {
    let url = `${FIRESTORE_BASE_URL}/${collection}?key=${firebaseConfig.apiKey}`;
    if(docId) url = `${FIRESTORE_BASE_URL}/${collection}?documentId=${docId}&key=${firebaseConfig.apiKey}`
    
    const response = await axios.post(url, {
      fields: data,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating document:", error.response || error);
    if (error.response?.status === 409) {
      console.warn(`Document already exists in collection ${collection}`);
      throw {
        code: 'ALREADY_EXISTS',
        message: `Document already exists in collection ${collection}`,
        status: 'ALREADY_EXISTS'
      };
    }
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export const updateDocument = async (docPath, data, token) => {
  try {
    const fieldPaths = Object.keys(data).map(key => `fields.${key}`);
    const updateMask = fieldPaths.join(',');
    
    const response = await axios.patch(`${FIRESTORE_BASE_URL}/${docPath}?updateMask.fieldPaths=${updateMask}&key=${firebaseConfig.apiKey}`, {
      fields: data,
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating document:", error.response || error);
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export const deleteDocument = async (docPath, token) => {
  try {
    const response = await axios.delete(`${FIRESTORE_BASE_URL}/${docPath}?key=${firebaseConfig.apiKey}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting document:", error.response || error);
    if (error.response?.data?.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};
