import axios from 'axios';
import { APP_CONFIG } from '../config/appConfig.js';

const { CLOUD_NAME, UPLOAD_PRESET } = APP_CONFIG.CLOUDINARY;

export const uploadFile = async (file) => {
  try {
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    const response = await axios.post(uploadUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return {
      url: response.data.secure_url,
      publicId: response.data.public_id,
    };

  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error.response || error);
    throw error.response?.data?.error || error.message;
  }
};

export const deleteFile = async (publicId) => {
  try {
    if (!publicId) {
      console.warn("No publicId provided for deletion");
      return false;
    }

    console.log(`Would delete file with publicId: ${publicId}`);
    
    
    return true;
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error.response || error);
    return false;
  }
};

export const checkImageExists = async (publicId) => {
  try {
    if (!publicId) return false;
    
    const infoUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${publicId}`;
    const response = await axios.head(infoUrl);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};