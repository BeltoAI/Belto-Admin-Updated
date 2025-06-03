// Context Extractor - Helper functions to extract chat context
// Usage: node context-extractor.js

// Sample API response (replace with your actual API call)
const sampleResponse = {
  "success": true,
  "lectureId": "67cecf4239c46f6c0fe0b0c1",
  "lectureTitle": "Testing Lecture 5",
  "summary": {
    "totalSessions": 1,
    "totalMessages": 5,
    "totalUserMessages": 3,
    "totalBotMessages": 2,
    "totalAttachments": 1,
    "uniqueUsers": 1,
    "averageMessagesPerSession": 5
  },
  "chatSessions": [
    {
      "sessionId": "67ce26eaf2d6f5f8f590205b",
      "userId": "67b2f30d751eaed25a25e486",
      "title": "Testing Lecture 5",
      "createdAt": "2025-03-09T23:40:26.311Z",
      "updatedAt": "2025-06-02T04:37:59.294Z",
      "messageCount": 5,
      "userMessageCount": 3,
      "botMessageCount": 2,
      "messages": [
        // ... messages array from your response
      ]
    }
  ]
};

// Context extraction functions
class ChatContextExtractor {
  constructor(apiResponse) {
    this.data = apiResponse;
  }

  // Get all user messages (questions/prompts)
  getUserMessages() {
    const userMessages = [];
    this.data.chatSessions.forEach(session => {
      session.messages.forEach(msg => {
        if (!msg.isBot) {
          userMessages.push({
            message: msg.message,
            timestamp: msg.timestamp,
            attachments: msg.attachments || [],
            userName: msg.name
          });
        }
      });
    });
    return userMessages;
  }

  // Get all bot responses
  getBotResponses() {
    const botResponses = [];
    this.data.chatSessions.forEach(session => {
      session.messages.forEach(msg => {
        if (msg.isBot) {
          botResponses.push({
            message: msg.message,
            timestamp: msg.timestamp,
            tokenUsage: msg.tokenUsage
          });
        }
      });
    });
    return botResponses;
  }

  // Get complete conversation flow
  getConversationFlow() {
    const conversations = [];
    this.data.chatSessions.forEach(session => {
      const conversation = {
        sessionId: session.sessionId,
        sessionTitle: session.title,
        userId: session.userId,
        timeline: session.messages.map(msg => ({
          type: msg.isBot ? 'bot' : 'user',
          speaker: msg.name,
          message: msg.message,
          timestamp: msg.timestamp,
          attachments: msg.attachments || [],
          tokenUsage: msg.tokenUsage
        }))
      };
      conversations.push(conversation);
    });
    return conversations;
  }

  // Get all file attachments and their content
  getAttachments() {
    const attachments = [];
    this.data.chatSessions.forEach(session => {
      session.messages.forEach(msg => {
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(attachment => {
            attachments.push({
              fileName: attachment.name,
              content: attachment.content,
              uploadedAt: msg.timestamp,
              userId: session.userId,
              sessionId: session.sessionId
            });
          });
        }
      });
    });
    return attachments;
  }

  // Get conversation summary
  getSummary() {
    return {
      lectureInfo: {
        id: this.data.lectureId,
        title: this.data.lectureTitle
      },
      statistics: this.data.summary,
      conversationTopics: this.extractTopics(),
      filesSummary: this.getFilesSummary()
    };
  }

  // Extract conversation topics/themes
  extractTopics() {
    const userMessages = this.getUserMessages();
    const topics = userMessages.map(msg => {
      // Simple topic extraction based on keywords
      const message = msg.message.toLowerCase();
      if (message.includes('summarize') || message.includes('summary')) {
        return 'Document Summarization';
      } else if (message.includes('pdf') || message.includes('file')) {
        return 'File Analysis';
      } else if (message.includes('hall') || message.includes('location')) {
        return 'Location Inquiry';
      }
      return 'General Query';
    });
    return [...new Set(topics)]; // Remove duplicates
  }

  // Get files summary
  getFilesSummary() {
    const attachments = this.getAttachments();
    return attachments.map(att => ({
      fileName: att.fileName,
      contentPreview: att.content.substring(0, 200) + '...',
      uploadedAt: att.uploadedAt
    }));
  }

  // Get context for specific use cases
  getContextForRAG() {
    // Context suitable for RAG (Retrieval Augmented Generation)
    const context = [];
    
    this.data.chatSessions.forEach(session => {
      // Add document content from attachments
      session.messages.forEach(msg => {
        if (msg.attachments && msg.attachments.length > 0) {
          msg.attachments.forEach(att => {
            context.push({
              type: 'document',
              source: att.name,
              content: att.content,
              timestamp: msg.timestamp
            });
          });
        }
        
        // Add bot responses as learned context
        if (msg.isBot) {
          context.push({
            type: 'response',
            content: msg.message,
            timestamp: msg.timestamp,
            tokenUsage: msg.tokenUsage
          });
        }
      });
    });
    
    return context;
  }
}

// Usage example
function demonstrateContextExtraction() {
  const extractor = new ChatContextExtractor(sampleResponse);
  
  console.log('=== CHAT CONTEXT EXTRACTION ===\n');
  
  console.log('1. User Messages:');
  console.log(JSON.stringify(extractor.getUserMessages(), null, 2));
  
  console.log('\n2. Bot Responses:');
  console.log(JSON.stringify(extractor.getBotResponses(), null, 2));
  
  console.log('\n3. Complete Conversation Flow:');
  console.log(JSON.stringify(extractor.getConversationFlow(), null, 2));
  
  console.log('\n4. Attachments:');
  console.log(JSON.stringify(extractor.getAttachments(), null, 2));
  
  console.log('\n5. Summary:');
  console.log(JSON.stringify(extractor.getSummary(), null, 2));
  
  console.log('\n6. RAG Context:');
  console.log(JSON.stringify(extractor.getContextForRAG(), null, 2));
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ChatContextExtractor;
} else {
  // Run demo if executed directly
  demonstrateContextExtraction();
}
