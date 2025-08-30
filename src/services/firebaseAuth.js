import axios from 'axios';
import firebaseConfig from '../firebaseConfig';
import { createDocument, updateDocument } from './firestore';

const API_KEY = firebaseConfig.apiKey;
const BASE_URL = "https://identitytoolkit.googleapis.com/v1/accounts:";


export const signUpAdmin = async (email, password, displayName) => {
  try {
    const response = await axios.post(`${BASE_URL}signUp?key=${API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });
    const { localId, idToken } = response.data;
    
    const restaurantData = {
      name: { stringValue: displayName },
      email: { stringValue: email },
      adminId: { stringValue: localId },
      createdAt: { timestampValue: new Date().toISOString() },
      updatedAt: { timestampValue: new Date().toISOString() },
      status: { stringValue: 'active' }
    };
    await createDocument(`restaurants`, restaurantData, idToken, localId);
    
    return {
      ...response.data,
      restaurantId: localId 
    };
  } catch (error) {
    throw error.response.data.error;
  }
};

export const loginAdmin = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}signInWithPassword?key=${API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });
    return response.data;
  } catch (error) {
    throw error.response.data.error;
  }
};

export const signUpUser = async (email, password, name) => {
  try {
    const response = await axios.post(`${BASE_URL}signUp?key=${API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });
    const { localId, idToken } = response.data;
    
    await createDocument(`users`, {
      name: { stringValue: name },
      email: { stringValue: email },
      userId: { stringValue: localId },
      address: { stringValue: "" }, 
    }, idToken, localId);
    return response.data;
  } catch (error) {
    throw error.response.data.error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const response = await axios.post(`${BASE_URL}signInWithPassword?key=${API_KEY}`, {
      email,
      password,
      returnSecureToken: true,
    });
    return response.data;
  } catch (error) {
    throw error.response.data.error;
  }
};

export const sendPasswordResetEmail = async (email) => {
  try {
    await axios.post(`${BASE_URL}sendOobCode?key=${API_KEY}`, {
      requestType: "PASSWORD_RESET",
      email,
    });
    return { success: true };
  } catch (error) {
    throw error.response.data.error;
  }
};

export const updateUserProfileFirebase = async (idToken, displayName, address) => {
  try {
    const response = await axios.post(`${BASE_URL}update?key=${API_KEY}`, {
      idToken,
      displayName,
      
      returnSecureToken: true,
    });
    return response.data;
  } catch (error) {
    throw error.response.data.error;
  }
};

export const validateToken = async (idToken) => {
  try {
    const response = await axios.post(`${BASE_URL}lookup?key=${API_KEY}`, {
      idToken,
    });
    
    const tokenAge = Date.now() - (response.data.users[0]?.lastLoginAt || 0);
    const TOKEN_LIFETIME = 60 * 60 * 1000; 
    
    if (tokenAge > TOKEN_LIFETIME) {
      throw {
        code: 'TOKEN_EXPIRED',
        message: 'Token has expired. Please login again.',
        status: 'EXPIRED'
      };
    }
    return response.data;
  } catch (error) {
    if (error.code === 'TOKEN_EXPIRED') {
      throw error;
    }
    throw error.response?.data?.error || error;
  }
};


export const refreshToken = async (refreshToken) => {
  try {
    const response = await axios.post(`${BASE_URL}token?key=${API_KEY}`, {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    return response.data;
  } catch (error) {
    throw error.response?.data?.error || error;
  }
};
