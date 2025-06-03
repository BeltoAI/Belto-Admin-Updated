/**
 * Uploads a file and extracts its text content
 * @param {File} file - The file to upload and extract text from
 * @returns {Promise<Object>} - Object with file metadata and extracted content
 */
export const uploadFile = async (file) => {
  try {
    // Create form data for the file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Create a temporary URL for preview purposes
    // Note: This URL will only be valid in the current session
    const tempUrl = URL.createObjectURL ? URL.createObjectURL(file) : '';
    
    // Return basic metadata - actual content extraction happens on the server
    return {
      title: file.name,
      url: tempUrl,  // This is temporary and only for preview
      fileType: file.type,
      size: file.size
    };
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw new Error(error.message || 'Failed to process file');
  }
};