export const parseFirestoreDocument = (doc) => {
  if (!doc) {
    console.warn('parseFirestoreDocument: Document is null or undefined');
    return null;
  }
  
  if (typeof doc !== 'object') {
    console.warn('parseFirestoreDocument: Document is not an object:', typeof doc, doc);
    return null;
  }
  
  if (!doc.fields) {
    console.warn('parseFirestoreDocument: Document has no fields property:', doc);
    return null;
  }

  const parsedDoc = {};
  
  if (doc.name && typeof doc.name === 'string') {
    try {
      parsedDoc.id = doc.name.split('/').pop();
    } catch (error) {
      console.warn('Could not parse document ID from name:', doc.name, error);
      parsedDoc.id = null;
    }
  } else {
    parsedDoc.id = null;
  }

  for (const key in doc.fields) {
    const field = doc.fields[key];
    if (!field) continue;
    
    try {
      if (field.stringValue !== undefined) {
        parsedDoc[key] = field.stringValue;
      } else if (field.integerValue !== undefined) {
        parsedDoc[key] = parseInt(field.integerValue, 10);
      } else if (field.booleanValue !== undefined) {
        parsedDoc[key] = field.booleanValue;
      } else if (field.doubleValue !== undefined) {
        parsedDoc[key] = parseFloat(field.doubleValue);
      } else if (field.timestampValue !== undefined) {
        parsedDoc[key] = field.timestampValue;
      } else if (field.mapValue !== undefined) {
        parsedDoc[key] = parseMapValue(field.mapValue);
      } else if (field.arrayValue !== undefined) {
        parsedDoc[key] = parseArrayValue(field.arrayValue);
      }
    } catch (error) {
      console.warn(`Error parsing field ${key}:`, error, 'Field value:', field);
      parsedDoc[key] = null;
    }
  }
  
  return parsedDoc;
};

const parseMapValue = (mapValue) => {
  if (!mapValue || !mapValue.fields) {
    return {};
  }
  
  const result = {};
  for (const key in mapValue.fields) {
    try {
      result[key] = parseFirestoreDocument({ fields: { [key]: mapValue.fields[key] } })[key];
    } catch (error) {
      console.warn(`Error parsing map field ${key}:`, error);
      result[key] = null;
    }
  }
  return result;
};

const parseArrayValue = (arrayValue) => {
  if (!arrayValue || !arrayValue.values || !Array.isArray(arrayValue.values)) {
    return [];
  }
  
  return arrayValue.values.map((item, index) => {
    try {
      if (item.stringValue !== undefined) {
        return item.stringValue;
      } else if (item.integerValue !== undefined) {
        return parseInt(item.integerValue, 10);
      } else if (item.doubleValue !== undefined) {
        return parseFloat(item.doubleValue);
      } else if (item.booleanValue !== undefined) {
        return item.booleanValue;
      } else if (item.mapValue !== undefined) {
        return parseMapValue(item.mapValue);
      }
    } catch (error) {
      console.warn(`Error parsing array item at index ${index}:`, error);
      return null;
    }
  });
};

export const parseDocumentCreationResponse = (response) => {
  if (!response) {
    console.warn('parseDocumentCreationResponse: Response is null or undefined');
    return null;
  }
  
  let documentId = null;
  
  if (response.name && typeof response.name === 'string') {
    try {
      documentId = response.name.split('/').pop();
    } catch (error) {
      console.warn('Could not parse document ID from name:', response.name, error);
    }
  } else if (response.documentId) {
    documentId = response.documentId;
  } else if (response.id) {
    documentId = response.id;
  }
  
  return {
    id: documentId,
    name: response.name || null,
    createTime: response.createTime || null,
    updateTime: response.updateTime || null,
    ...response
  };
};
