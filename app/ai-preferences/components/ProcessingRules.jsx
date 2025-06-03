import React from 'react';

const ProcessingRules = ({ 
  processingRules, 
  setProcessingRules, 
  formatText, 
  setFormatText, 
  citationStyle, 
  setCitationStyle 
}) => {
  return (
    <div className="bg-[#111111] rounded-xl p-4 md:p-6">
      <h2 className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Pre / Post Processing Rules</h2>
      <div className="space-y-3 md:space-y-4">
        {Object.entries(processingRules).map(([key, value]) => (
          <div key={key} className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={value}
              onChange={() => setProcessingRules(prev => ({ ...prev, [key]: !value }))}
              className="w-4 h-4 accent-yellow-400"
            />
            <span className="text-gray-300 text-sm md:text-base capitalize">
              {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
            </span>
            {key === "formatText" && value && (
              <input
                type="text"
                value={formatText}
                onChange={(e) => setFormatText(e.target.value)}
                className="bg-[#1a1a1a] text-white rounded-lg px-3 md:px-4 py-2 text-sm md:text-base ml-2 flex-1"
              />
            )}
            {key === "addCitations" && value && (
              <select
                value={citationStyle}
                onChange={(e) => setCitationStyle(e.target.value)}
                className="bg-[#1a1a1a] text-white rounded-lg px-3 md:px-4 py-2 text-sm md:text-base ml-2"
              >
                <option value="APA">APA</option>
                <option value="MLA">MLA</option>
                <option value="Chicago">Chicago</option>
              </select>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProcessingRules;