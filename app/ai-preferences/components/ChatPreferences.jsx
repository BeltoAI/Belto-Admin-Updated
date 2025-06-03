import React, { useState } from 'react';
import { FiInfo, FiX } from 'react-icons/fi';

const ChatPreferences = ({ preferences, onRefreshPreferences }) => {
  const [showInfo, setShowInfo] = useState(false);

  const toggleInfo = () => {
    // Refresh preferences data when opening the panel
    if (!showInfo) {
      onRefreshPreferences();
    }
    setShowInfo(!showInfo);
  };

  return (
    <div className="relative">
      <button
        onClick={toggleInfo}
        className="text-gray-400 hover:text-yellow-400 transition-colors"
        title="View active AI preferences"
      >
        <FiInfo size={18} />
      </button>

      {showInfo && (
        <div className="absolute right-0 bottom-full mb-2 w-96 bg-[#1a1a1a] rounded-lg shadow-lg p-4 z-10 border border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-white font-medium text-base">Active AI Settings</h4>
            <button 
              onClick={() => setShowInfo(false)}
              className="text-gray-400 hover:text-white"
            >
              <FiX size={16} />
            </button>
          </div>
          
          {!preferences || Object.keys(preferences).length === 0 ? (
            <div className="text-gray-400 py-3 text-center">
              No AI preferences configured for this session.
            </div>
          ) : (
            <div className="space-y-3 text-sm max-h-[500px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Model</span>
                  <span className="text-yellow-400 font-medium">{preferences.model || 'Default'}</span>
                </div>
                
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Temperature</span>
                  <span className="text-white">{preferences.temperature || 'Default'}</span>
                </div>
                
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Max Tokens</span>
                  <span className="text-white">{preferences.maxTokens || 'Default'}</span>
                </div>
                
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Max Prompts</span>
                  <span className="text-white">{preferences.numPrompts || 'Unlimited'}</span>
                </div>
                
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Streaming</span>
                  <span className="text-white">{preferences.streaming !== undefined ? (preferences.streaming ? 'On' : 'Off') : 'Default'}</span>
                </div>
                
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Token Prediction</span>
                  <span className="text-white">{preferences.tokenPredictionLimit || 'Not set'}</span>
                </div>
              </div>
              
              {preferences.processingRules && (
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-1">Processing Rules</span>
                  <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-2">
                    {Object.entries(preferences.processingRules).map(([key, value]) => (
                      <div key={key} className="flex items-center">
                        <div className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
                        <span className="text-gray-300 text-xs">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.systemPrompts && preferences.systemPrompts.length > 0 && (
                <div className="bg-gray-800 rounded-md p-2">
                  <span className="text-gray-400 block mb-2">System Prompts</span>
                  <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                    {preferences.systemPrompts.map((prompt, index) => (
                      <div key={index} className="bg-gray-700 rounded p-2">
                        <h6 className="text-yellow-400 text-xs font-medium mb-1">{prompt.name}</h6>
                        <p className="text-gray-300 text-xs">{prompt.content.length > 100 
                          ? prompt.content.substring(0, 100) + '...' 
                          : prompt.content}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {preferences.updatedAt && (
                <div className="border-t border-gray-700 pt-2">
                  <span className="text-gray-500 text-xs">
                    Last updated: {new Date(preferences.updatedAt).toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatPreferences;