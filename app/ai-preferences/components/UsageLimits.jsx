import React, { useState } from 'react';
import { Check, Loader2, Youtube, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const UsageLimits = ({ maxTokens, setMaxTokens, numPrompts, setNumPrompts, accessUrl, setAccessUrl, onContentAdded }) => {
  const [extractedContent, setExtractedContent] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [contentAdded, setContentAdded] = useState(false);
  const [showContentPreview, setShowContentPreview] = useState(false);
  const [showFullContent, setShowFullContent] = useState(false);

  const isYoutubeLink = accessUrl?.includes('youtube.com') || accessUrl?.includes('youtu.be');

  const extractLinkContent = async () => {
    if (!accessUrl?.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      setContentAdded(false);
      setShowContentPreview(false);
      setShowFullContent(false);
      
      // Use our server proxy instead of calling the external API directly
      const apiUrl = '/api/proxy/linkreader';

      console.log('Extracting content from URL:', accessUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          url: accessUrl
        })
      }).catch(err => {
        console.error('Network error:', err);
        throw new Error('Network error: Cannot connect to the proxy service');
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        const errorMessage = errorData.error || response.statusText;
        console.error('API response error:', response.status, errorMessage);
        throw new Error(`API error: ${errorMessage}`);
      }

      const data = await response.json();
      console.log('Content extracted successfully');
      setExtractedContent(data);
      setShowContentPreview(true);
    } catch (err) {
      console.error('Error extracting content:', err);
      
      // For testing only - create mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock data for development');
        const mockContent = {
          content: `This is mock content for testing purposes. The URL was ${accessUrl}. This simulates content that would be extracted from the website or YouTube video. This is a longer piece of text to demonstrate the show more/show less functionality. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget ultricies ultrices, nunc nisl ultricies nunc, quis ultricies nisl nisl eget ultricies ultrices. Nullam euismod, nisl eget ultricies ultrices, nunc nisl ultricies nunc, quis ultricies nisl nisl eget ultricies ultrices.`,
          title: isYoutubeLink ? 'Mock YouTube Video' : 'Mock Website Content',
          source: accessUrl
        };
        setExtractedContent(mockContent);
        setShowContentPreview(true);
        setError('Using mock data (API failed): ' + err.message);
      } else {
        setError(`Failed to extract content: ${err.message}`);
      }
    } finally {
      setIsLoading(false);
    }
  };  const addToContext = async () => {
    if (extractedContent) {
      try {
        setIsLoading(true);
        console.log('Adding to context:', extractedContent);

        // Get the current URL parameters to identify the lecture
        const urlParams = new URLSearchParams(window.location.search);
        const lectureId = urlParams.get('lectureId');
        
        if (!lectureId) {
          throw new Error('No lecture ID found. Please select a lecture first.');
        }

        // Use the dedicated extracted-content API endpoint
        const response = await fetch('/api/ai-preferences/extracted-content', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            lectureId: lectureId,
            url: accessUrl,
            title: extractedContent.title || 'Extracted Content',
            content: extractedContent.content,
            contentType: isYoutubeLink ? 'youtube' : 'webpage',
            metadata: {
              wordCount: extractedContent.content ? extractedContent.content.split(/\s+/).length : 0,
              language: 'en',
              encoding: 'UTF-8',
              source: extractedContent.source || accessUrl,
              extractedAt: new Date().toISOString()
            }
          })
        });        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to save content to lecture context');
        }

        const result = await response.json();
        console.log('Content successfully added to lecture context:', result);
        
        setContentAdded(true);
        
        // Notify parent component that content was added
        if (onContentAdded) {
          onContentAdded(result);
        }
        
        // Reset the success state after 3 seconds
        setTimeout(() => {
          setContentAdded(false);
        }, 3000);
      } catch (err) {
        console.error('Error adding content to context:', err);
        setError(`Failed to add to context: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const clearExtractedContent = () => {
    setShowContentPreview(false);
    setExtractedContent(null);
    setError(null);
    setShowFullContent(false);
  };

  const toggleFullContent = () => {
    setShowFullContent(!showFullContent);
  };

  return (
    <div className="bg-[#111111] rounded-xl p-4 md:p-6">
      <h2 className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Usage Limits</h2>
      <div className="space-y-3 md:space-y-4">
        {/* Max Tokens Field */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <span className="text-gray-400 text-sm md:text-base min-w-[100px] md:w-40">Max Tokens:</span>
          <input
            type="text"
            placeholder="#Number here#"
            className="w-full bg-[#1a1a1a] text-white rounded-lg px-3 md:px-4 py-2 text-sm md:text-base"
            value={maxTokens}
            onChange={(e) => setMaxTokens(e.target.value)}
          />
        </div>
        
        {/* Number of Prompts Field */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
          <div className="w-3 h-3 bg-yellow-400 rounded-full" />
          <span className="text-gray-400 text-sm md:text-base min-w-[100px] md:w-40">Number of Prompts:</span>
          <input
            type="text"
            placeholder="#Number here#"
            className="w-full bg-[#1a1a1a] text-white rounded-lg px-3 md:px-4 py-2 text-sm md:text-base"
            value={numPrompts}
            onChange={(e) => setNumPrompts(e.target.value)}
          />
        </div>
        
        {/* Enable access to Field with Content Extraction */}
        <div>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full" />
            <span className="text-gray-400 text-sm md:text-base min-w-[100px] md:w-40">Enable access to:</span>
            <div className="flex w-full">
              <div className="flex-grow">
                <input
                  type="text"
                  placeholder="Enter website or YouTube URL"
                  className="w-full bg-[#1a1a1a] text-white rounded-l-lg px-3 md:px-4 py-2 text-sm md:text-base"
                  value={accessUrl || ''}
                  onChange={(e) => setAccessUrl(e.target.value)}
                />
              </div>
              <button
                className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 rounded-r-lg flex items-center justify-center disabled:opacity-50"
                onClick={extractLinkContent}
                disabled={isLoading || !accessUrl?.trim()}
                title="Extract content from URL"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  isYoutubeLink ? <Youtube className="w-5 h-5" /> : <ExternalLink className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="text-red-400 text-sm mt-2 bg-red-900/20 p-2 rounded ml-11">
              {error}
              {process.env.NODE_ENV === 'development' && (
                <div className="mt-2 text-xs">
                  <p>Troubleshooting tips:</p>
                  <ul className="list-disc pl-4">
                    <li>Check if the API endpoint is accessible</li>
                    <li>Verify your API key is correct</li>
                    <li>Ensure the URL is valid and accessible</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          {/* Extracted Content Preview */}
          {extractedContent && showContentPreview && (
            <div className="mt-3 space-y-3 ml-11">
              <div className="bg-[#1a1a1a] rounded-lg p-3 overflow-hidden">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-yellow-400 text-sm">
                    {isYoutubeLink ? 'YouTube Content' : 'Website Content'} Extracted:
                  </h3>
                  <button 
                    className="text-gray-400 hover:text-white text-xs"
                    onClick={clearExtractedContent}
                  >
                    Close
                  </button>
                </div>
                
                {/* Content display with either truncated or full view */}
                <div className={`text-gray-300 text-sm ${showFullContent ? '' : 'max-h-40 overflow-y-auto'}`}>
                  {extractedContent.content 
                    ? showFullContent 
                      ? extractedContent.content 
                      : `${extractedContent.content.substring(0, 150)}${extractedContent.content.length > 150 ? '...' : ''}`
                    : 'No content extracted'}
                </div>
                
                {/* Show more/less toggle button */}
                {extractedContent.content && extractedContent.content.length > 150 && (
                  <button 
                    onClick={toggleFullContent}
                    className="mt-2 text-yellow-400 hover:text-yellow-300 text-xs flex items-center gap-1"
                  >
                    {showFullContent ? (
                      <>
                        Show Less <ChevronUp className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        Show Full Text <ChevronDown className="w-3 h-3" />
                      </>
                    )}
                  </button>
                )}
              </div>
              
              <div className="flex justify-end">
                <button
                  className={`px-4 py-1.5 rounded text-sm flex items-center gap-2 ${
                    contentAdded 
                      ? 'bg-green-500/20 text-green-400' 
                      : 'bg-yellow-500 hover:bg-yellow-600 text-black'
                  }`}
                  onClick={addToContext}
                  disabled={contentAdded}
                >
                  {contentAdded ? (
                    <>
                      <Check className="w-4 h-4" /> Added to Context
                    </>
                  ) : (
                    'Add to Lecture Context'
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsageLimits;