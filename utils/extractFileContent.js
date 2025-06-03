import mammoth from 'mammoth';

export async function extractFileContent(file) {
    const fileType = file.type;

    // PDF files are not allowed
    if (fileType === 'application/pdf') {
        console.error('PDF files are not allowed. Please upload doc files.');
        return 'PDF files are not allowed. Please upload doc files.';
    } 
    // Word document extraction
    else if (
        fileType === 'application/msword' || 
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer });
            return result.value;
        } catch (error) {
            console.error('Error extracting Word document content:', error);
            return '';
        }
    }
    
    return ''; // For unsupported file types
}