# AI Preferences Extracted Content Implementation

## Overview
This implementation adds comprehensive extracted content functionality to the AI Preferences system, allowing users to extract content from URLs and store it in the database for enhanced RAG (Retrieval-Augmented Generation) responses.

## What's Been Implemented

### 1. Database Model Updates
- ✅ `AIPreference.js` model already includes `extractedContent` field as an array
- ✅ Each extracted content item includes:
  - `url`: Source URL
  - `title`: Content title
  - `content`: Extracted text content
  - `extractedAt`: Timestamp
  - `contentType`: Type (webpage, youtube, etc.)
  - `metadata`: Word count, language, encoding

### 2. API Routes
- ✅ **POST** `/api/ai-preferences/extracted-content` - Add new extracted content
- ✅ **GET** `/api/ai-preferences/extracted-content?lectureId=X` - Fetch stored content
- ✅ **DELETE** `/api/ai-preferences/extracted-content?lectureId=X&url=Y` - Delete content
- ✅ Updated main AI preferences route to handle extracted content properly

### 3. Frontend Components

#### UsageLimits Component (`components/UsageLimits.jsx`)
- ✅ Updated "Add to Context" functionality to use dedicated API endpoint
- ✅ Proper error handling and success feedback
- ✅ Callback to parent component when content is added
- ✅ Support for both website and YouTube content types

#### StoredContent Component (`components/StoredContent.jsx`)
- ✅ **NEW**: Display all stored extracted content for a lecture
- ✅ Expandable content preview (show more/less)
- ✅ Delete functionality for individual content items
- ✅ Content type icons (webpage/YouTube)
- ✅ Metadata display (word count, date added)
- ✅ Auto-refresh when new content is added

#### Main AI Preferences Page (`page.jsx`)
- ✅ Added StoredContent component to the layout
- ✅ Refresh coordination between UsageLimits and StoredContent
- ✅ Toast notifications for user feedback

### 4. RAG Service Integration
- ✅ `lib/rag-service.js` already properly handles array format
- ✅ Chunks extracted content for better retrieval
- ✅ Includes metadata in search results
- ✅ Backward compatibility with legacy formats

### 5. Enhanced Features
- ✅ Real-time content management (add/view/delete)
- ✅ Content type detection (webpage vs YouTube)
- ✅ Word count and metadata tracking
- ✅ Improved error handling and user feedback
- ✅ Responsive design for mobile/desktop

## How It Works

### User Workflow:
1. **Extract Content**: User enters URL in "Enable Access To" field
2. **Preview**: Content is extracted and shown in preview
3. **Add to Context**: User clicks "Add to Context" button
4. **Storage**: Content is saved to database via API
5. **Display**: Content appears in "Stored Context Content" section
6. **Usage**: RAG service uses stored content for enhanced responses

### Technical Flow:
1. URL content extraction via proxy API
2. Content validation and processing
3. Database storage with metadata
4. Real-time UI updates
5. RAG integration for intelligent responses

## API Endpoints Summary

### Add Content
```http
POST /api/ai-preferences/extracted-content
Content-Type: application/json

{
  "lectureId": "lecture_id",
  "url": "https://example.com",
  "title": "Page Title",
  "content": "Extracted text content...",
  "contentType": "webpage",
  "metadata": {
    "wordCount": 500,
    "language": "en"
  }
}
```

### Get Content
```http
GET /api/ai-preferences/extracted-content?lectureId=lecture_id
```

### Delete Content
```http
DELETE /api/ai-preferences/extracted-content?lectureId=lecture_id&url=encoded_url
```

## Benefits
- ✅ **Enhanced RAG**: More accurate responses using extracted content
- ✅ **Content Management**: Easy add/view/delete of reference materials
- ✅ **Better UX**: Real-time feedback and content preview
- ✅ **Scalable**: Supports multiple content sources per lecture
- ✅ **Integrated**: Seamlessly works with existing chat system

## Next Steps (Optional Enhancements)
- [ ] Bulk content management
- [ ] Content search/filtering
- [ ] Content categorization/tagging
- [ ] Content update/refresh functionality
- [ ] Export/import of content collections
