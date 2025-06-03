import React, { useState, useRef, useEffect } from 'react';
import { FiChevronDown, FiPlus, FiX, FiEdit, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import axios from 'axios';

const CustomizeBehavior = ({ 
  temperature, 
  setTemperature, 
  streaming, 
  setStreaming, 
  tokenPredictionLimit, 
  setTokenPredictionLimit,
  lectureId,
  systemPrompts = [],
  setSystemPrompts
}) => {
  // Modal management states
  const [showPromptsModal, setShowPromptsModal] = useState(false);
  const [showAddPromptModal, setShowAddPromptModal] = useState(false);
  const [showViewAllModal, setShowViewAllModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form states
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(null);
  const [promptName, setPromptName] = useState('');
  const [promptContent, setPromptContent] = useState('');
  const [selectedPromptId, setSelectedPromptId] = useState(null);
  
  // References for modal clicks
  const addPromptModalRef = useRef(null);
  const viewPromptsModalRef = useRef(null);
  const viewAllModalRef = useRef(null);
  
  // Fetch system prompts when the component mounts or lectureId changes
  useEffect(() => {
    if (lectureId) {
      fetchSystemPrompts();
    }
  }, [lectureId]);
  
  // Fetch system prompts from the API
  const fetchSystemPrompts = async () => {
    if (!lectureId) return;
    
    try {
      setIsLoading(true);
      const response = await axios.get(`/api/system-prompts?lectureId=${lectureId}`);
      
      if (response.data && response.data.length > 0) {
        setSystemPrompts(response.data);
      } else if (systemPrompts.length === 0) {
        // Use default prompts if no custom ones exist and we don't already have any
        const defaultPrompts = [
          {
            name: 'Default Assistant',
            content: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses.',
            lectureId
          },
          {
            name: 'Technical Expert',
            content: 'You are a technical expert with deep knowledge of programming and software development. Provide detailed technical explanations and code examples when appropriate.',
            lectureId
          }
        ];
        
        // Save default prompts to database
        for (const prompt of defaultPrompts) {
          await axios.post('/api/system-prompts', prompt);
        }
        
        // Fetch again to get the saved prompts with their IDs
        const newResponse = await axios.get(`/api/system-prompts?lectureId=${lectureId}`);
        setSystemPrompts(newResponse.data);
      }
    } catch (error) {
      console.error('Error fetching system prompts:', error);
      toast.error('Failed to load system prompts');
    } finally {
      setIsLoading(false);
    }
  };

  // Close modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showAddPromptModal && addPromptModalRef.current && !addPromptModalRef.current.contains(event.target)) {
        setShowAddPromptModal(false);
      }
      if (showPromptsModal && viewPromptsModalRef.current && !viewPromptsModalRef.current.contains(event.target)) {
        setShowPromptsModal(false);
      }
      if (showViewAllModal && viewAllModalRef.current && !viewAllModalRef.current.contains(event.target)) {
        setShowViewAllModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showAddPromptModal, showPromptsModal, showViewAllModal]);

  // Handle opening the edit prompt modal
  const handleEditPrompt = (index) => {
    const prompt = systemPrompts[index];
    setSelectedPromptIndex(index);
    setSelectedPromptId(prompt._id);
    setPromptName(prompt.name);
    setPromptContent(prompt.content);
    setShowPromptsModal(false);
    setShowAddPromptModal(true);
  };

  // Handle opening the add prompt modal
  const handleAddPrompt = () => {
    setSelectedPromptIndex(null);
    setSelectedPromptId(null);
    setPromptName('');
    setPromptContent('');
    setShowAddPromptModal(true);
  };

  // Handle saving a prompt (add or edit)
  const handleSavePrompt = async () => {
    if (!promptName.trim() || !promptContent.trim()) {
      toast.error("Both name and content are required");
      return;
    }

    try {
      setIsLoading(true);
      
      if (selectedPromptId) {
        // Edit existing prompt
        await axios.put('/api/system-prompts', {
          _id: selectedPromptId,
          name: promptName,
          content: promptContent
        });
        
        toast.success('System prompt updated successfully');
      } else {
        // Add new prompt
        await axios.post('/api/system-prompts', {
          lectureId,
          name: promptName,
          content: promptContent
        });
        
        toast.success('System prompt added successfully');
      }
      
      // Refresh prompts from the server
      await fetchSystemPrompts();
      
      // Close modal and reset form
      setShowAddPromptModal(false);
      setPromptName('');
      setPromptContent('');
      setSelectedPromptIndex(null);
      setSelectedPromptId(null);
      
    } catch (error) {
      console.error('Error saving system prompt:', error);
      const errorMessage = error.response?.data?.error || 'Failed to save system prompt';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle deleting a prompt
  const handleDeletePrompt = async (promptId) => {
    if (window.confirm("Are you sure you want to delete this system prompt?")) {
      try {
        setIsLoading(true);
        await axios.delete(`/api/system-prompts/${promptId}`);
        
        toast.success('System prompt deleted successfully');
        
        // Refresh prompts from the server
        await fetchSystemPrompts();
        setShowPromptsModal(false);
      } catch (error) {
        console.error('Error deleting system prompt:', error);
        toast.error('Failed to delete system prompt');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="bg-[#111111] rounded-xl p-4 md:p-6">
      <h2 className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">Customize AI Behavior</h2>
      <div className="space-y-4 md:space-y-6">
        {/* Change System Prompts Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
          <button 
            onClick={() => setShowPromptsModal(true)} 
            className="flex items-center gap-2 text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base"
            disabled={isLoading}
          >
            <span>Change System Prompts</span>
            <FiChevronDown className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* Add System Prompts Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
          <button 
            onClick={handleAddPrompt}
            className="flex items-center gap-2 text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base"
            disabled={isLoading}
          >
            <span>Add System Prompts</span>
            <FiPlus className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
          </button>
        </div>

        {/* View System Prompts Button */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
          <button 
            onClick={() => setShowViewAllModal(true)}
            className="text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base"
            disabled={isLoading}
          >
            View
          </button>
        </div>

        {/* Temperature Control */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
          <span className="text-white min-w-[120px] text-sm md:text-base">Temperature</span>
          <div className="flex-1 flex items-center gap-2 md:gap-4 w-full">
            <input
              type="range"
              min="0"
              max="2"
              step="0.1"
              value={temperature}
              onChange={(e) => setTemperature(parseFloat(e.target.value))}
              className="flex-1 h-1 bg-gray-600 rounded-lg cursor-pointer"
            />
            <span className="text-white bg-gray-700 px-2 py-1 rounded-md text-sm md:text-base min-w-[40px] text-center">
              {temperature.toFixed(1)}
            </span>
          </div>
        </div>

        {/* Streaming Toggle */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
          <span className="text-white min-w-[120px] text-sm md:text-base">Streaming</span>
          <div className="flex gap-2 w-full md:w-auto">
            <button
              onClick={() => setStreaming(true)}
              className={`px-3 md:px-4 py-1 rounded-md text-sm md:text-base ${
                streaming ? "bg-yellow-400 text-black" : "border border-gray-600 text-white"
              }`}
            >
              On
            </button>
            <button
              onClick={() => setStreaming(false)}
              className={`px-3 md:px-4 py-1 rounded-md text-sm md:text-base ${
                !streaming ? "bg-yellow-400 text-black" : "border border-gray-600 text-white"
              }`}
            >
              Off
            </button>
          </div>
        </div>

        {/* Token Prediction Limit */}
        <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
          <span className="text-white min-w-[120px] text-sm md:text-base">Token Prediction:</span>
          <input
            type="text"
            value={tokenPredictionLimit}
            onChange={(e) => setTokenPredictionLimit(e.target.value)}
            placeholder="#Number here#"
            className="w-full bg-transparent text-white border border-gray-600 rounded-md px-3 md:px-4 py-1 text-sm md:text-base"
          />
        </div>
      </div>

      {/* Change/Edit System Prompts Modal */}
      {showPromptsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div ref={viewPromptsModalRef} className="bg-[#111111] rounded-xl p-6 w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-medium">System Prompts</h2>
              <button 
                onClick={() => setShowPromptsModal(false)} 
                className="text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            ) : systemPrompts.length === 0 ? (
              <p className="text-gray-400">No system prompts available.</p>
            ) : (
              <div className="space-y-3">
                {systemPrompts.map((prompt, index) => (
                  <div key={prompt._id || index} className="bg-[#1a1a1a] rounded-lg p-3 flex justify-between items-center">
                    <div className="flex-1 mr-2">
                      <h3 className="text-white text-sm font-medium">{prompt.name}</h3>
                      <p className="text-gray-400 text-xs truncate max-w-[300px]">{prompt.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditPrompt(index)}
                        className="text-gray-300 hover:text-yellow-400 p-1"
                        title="Edit"
                      >
                        <FiEdit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeletePrompt(prompt._id)}
                        className="text-gray-300 hover:text-red-500 p-1"
                        title="Delete"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit System Prompt Modal */}
      {showAddPromptModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div ref={addPromptModalRef} className="bg-[#111111] rounded-xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-medium">
                {selectedPromptId ? 'Edit System Prompt' : 'Add System Prompt'}
              </h2>
              <button 
                onClick={() => setShowAddPromptModal(false)} 
                className="text-gray-400 hover:text-white"
                disabled={isLoading}
              >
                <FiX size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Prompt Name</label>
                <input 
                  type="text" 
                  value={promptName}
                  onChange={(e) => setPromptName(e.target.value)}
                  placeholder="E.g., Technical Expert"
                  className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-md px-3 py-2"
                  disabled={isLoading}
                />
              </div>
              
              <div>
                <label className="block text-gray-400 text-sm mb-1">Prompt Content</label>
                <textarea 
                  value={promptContent}
                  onChange={(e) => setPromptContent(e.target.value)}
                  placeholder="Enter the system prompt content here..."
                  className="w-full bg-[#1a1a1a] text-white border border-gray-700 rounded-md px-3 py-2 h-40 resize-none"
                  disabled={isLoading}
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <button 
                  onClick={() => setShowAddPromptModal(false)}
                  className="px-4 py-2 border border-gray-700 rounded-md text-white"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePrompt}
                  className="px-4 py-2 bg-yellow-400 text-black rounded-md flex items-center gap-2"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin h-4 w-4 border-2 border-black border-t-transparent rounded-full"></span>
                      <span>Saving...</span>
                    </>
                  ) : (
                    selectedPromptId ? 'Update' : 'Add'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View All System Prompts Modal */}
      {showViewAllModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div ref={viewAllModalRef} className="bg-[#111111] rounded-xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-medium">All System Prompts</h2>
              <button 
                onClick={() => setShowViewAllModal(false)} 
                className="text-gray-400 hover:text-white"
              >
                <FiX size={20} />
              </button>
            </div>
            
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
              </div>
            ) : systemPrompts.length === 0 ? (
              <p className="text-gray-400">No system prompts available.</p>
            ) : (
              <div className="space-y-6">
                {systemPrompts.map((prompt, index) => (
                  <div key={prompt._id || index} className="bg-[#1a1a1a] rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-yellow-400 text-base font-medium">{prompt.name}</h3>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">Prompt #{index + 1}</span>
                        <button 
                          onClick={() => handleEditPrompt(index)}
                          className="text-gray-300 hover:text-yellow-400"
                          title="Edit"
                        >
                          <FiEdit size={16} />
                        </button>
                        <button 
                          onClick={() => handleDeletePrompt(prompt._id)}
                          className="text-gray-300 hover:text-red-500"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-[#262626] p-3 rounded border border-gray-700">
                      <p className="text-gray-300 text-sm whitespace-pre-wrap">{prompt.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomizeBehavior;