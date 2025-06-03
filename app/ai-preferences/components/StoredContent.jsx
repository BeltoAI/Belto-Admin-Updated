import React, { useState, useEffect } from 'react';
import { Trash2, ExternalLink, Youtube, Eye, ChevronDown, ChevronUp } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

const StoredContent = ({ refreshTrigger = 0 }) => {
  const [storedContent, setStoredContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedItems, setExpandedItems] = useState(new Set());
  
  const searchParams = useSearchParams();
  const lectureId = searchParams.get('lectureId');
  // Fetch stored content when component mounts
  useEffect(() => {
    if (lectureId) {
      fetchStoredContent();
    }
  }, [lectureId]);

  // Refresh when refreshTrigger changes
  useEffect(() => {
    if (lectureId && refreshTrigger > 0) {
      fetchStoredContent();
    }
  }, [refreshTrigger, lectureId]);

  const fetchStoredContent = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/ai-preferences/extracted-content?lectureId=${lectureId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch stored content');
      }
      
      const data = await response.json();
      setStoredContent(data.extractedContent || []);
    } catch (err) {
      console.error('Error fetching stored content:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteContent = async (url, contentId) => {
    try {
      const deleteUrl = contentId 
        ? `/api/ai-preferences/extracted-content?lectureId=${lectureId}&contentId=${contentId}`
        : `/api/ai-preferences/extracted-content?lectureId=${lectureId}&url=${encodeURIComponent(url)}`;
      
      const response = await fetch(deleteUrl, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete content');
      }
      
      // Refresh the list after deletion
      await fetchStoredContent();
    } catch (err) {
      console.error('Error deleting content:', err);
      setError(`Failed to delete content: ${err.message}`);
    }
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContentTypeIcon = (contentType) => {
    switch (contentType) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-red-500" />;
      case 'webpage':
      default:
        return <ExternalLink className="w-4 h-4 text-blue-500" />;
    }
  };

  if (!lectureId) {
    return (
      <div className="bg-[#111111] rounded-xl p-4 md:p-6">
        <h2 className="text-gray-300 mb-4 text-sm md:text-base">Stored Context Content</h2>
        <p className="text-gray-500 text-sm">Please select a lecture to view stored content.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] rounded-xl p-4 md:p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-gray-300 text-sm md:text-base">Stored Context Content</h2>
        <button
          onClick={fetchStoredContent}
          className="text-yellow-400 hover:text-yellow-300 text-xs"
          disabled={isLoading}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm mb-4 bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-yellow-400"></div>
          <span className="ml-2 text-gray-400 text-sm">Loading stored content...</span>
        </div>
      ) : storedContent.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm">No content stored yet.</p>
          <p className="text-gray-600 text-xs mt-1">
            Extract content from URLs above and click &quot;Add to Context&quot; to see it here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {storedContent.map((item, index) => {
            const isExpanded = expandedItems.has(index);
            const truncatedContent = item.content.length > 150 
              ? item.content.substring(0, 150) + '...' 
              : item.content;

            return (
              <div key={item._id || index} className="bg-[#1a1a1a] rounded-lg p-3 border border-gray-800">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    {getContentTypeIcon(item.contentType)}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white text-sm font-medium truncate">
                        {item.title || 'Untitled Content'}
                      </h3>
                      <p className="text-gray-400 text-xs truncate">
                        {item.url}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-gray-400 hover:text-white p-1"
                      title={isExpanded ? 'Show less' : 'Show more'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteContent(item.url, item._id)}
                      className="text-gray-400 hover:text-red-400 p-1"
                      title="Delete content"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="text-gray-300 text-xs mb-2">
                  {isExpanded ? item.content : truncatedContent}
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>Added: {formatDate(item.extractedAt)}</span>
                    {item.metadata?.wordCount && (
                      <span>{item.metadata.wordCount} words</span>
                    )}
                  </div>
                  {item.content.length > 150 && (
                    <button
                      onClick={() => toggleExpanded(index)}
                      className="text-yellow-400 hover:text-yellow-300"
                    >
                      {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StoredContent;