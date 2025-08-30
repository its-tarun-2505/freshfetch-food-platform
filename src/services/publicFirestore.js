import axios from 'axios';
import firebaseConfig from '../firebaseConfig';

const PROJECT_ID = firebaseConfig.projectId;
const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
export const getPublicCollection = async (collectionPath) => {
  try {
    const response = await axios.get(`${FIRESTORE_BASE_URL}/${collectionPath}?key=${firebaseConfig.apiKey}`); 
    if (!response.data.documents) {
      console.log(`No documents found in collection: ${collectionPath}`);
      return [];
    }
  
    return response.data.documents || [];
  } catch (error) {
    console.error("Error fetching public collection:", error.response || error);
    
    if (error.response) {
      console.error("Response status:", error.response.status);
      console.error("Response data:", error.response.data);
    }
    
    throw error.response?.data?.error || error;
  }
};

export const getPublicDocument = async (docPath) => {
  try {
    console.log(`Fetching public document: ${docPath}`);
    const response = await axios.get(`${FIRESTORE_BASE_URL}/${docPath}?key=${firebaseConfig.apiKey}`);
    console.log('Public document response:', response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching public document:", error.response || error);
    throw error.response?.data?.error || error;
  }
};
