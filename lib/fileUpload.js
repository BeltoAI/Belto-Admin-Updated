/**
 * Uploads a file and extracts its text content
 * @param {File} file - The file to upload
 * @param {string} classId - The class ID
 * @param {string} lectureId - The lecture ID
 * @returns {Promise<Object>} - The material object with extracted content
 */
export async function uploadAndExtractFile(file, classId, lectureId) {
  try {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch(`/api/classes/${classId}/lectures/${lectureId}/materials`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to upload file');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
}