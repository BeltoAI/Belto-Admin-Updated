// Test script to verify upload and RAG integration
const { connectToDatabase } = require('./lib/dbConnect');
const { retrieveRelevantContent } = require('./lib/rag-service');

async function testUploadIntegration() {
  try {
    await connectToDatabase();
    
    // Test with a sample lecture ID (you'll need to replace with actual ID)
    const lectureId = "sample-lecture-id";
    
    console.log("Testing RAG content retrieval...");
    const content = await retrieveRelevantContent("test query", lectureId);
    
    console.log("Retrieved content sources:");
    content.forEach((item, index) => {
      console.log(`${index + 1}. Source: ${item.source}`);
      console.log(`   Content preview: ${item.content.substring(0, 100)}...`);
      console.log(`   Score: ${item.score}`);
      console.log("---");
    });
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testUploadIntegration();
}

module.exports = { testUploadIntegration };
