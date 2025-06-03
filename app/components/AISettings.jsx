"use client";
import { FiInfo } from 'react-icons/fi';
import Tooltip from './ToolTip'; 

const AISettings = ({ settings, onChange }) => {
  const handleChange = (field, value) => {
    onChange({ ...settings, [field]: value });
  };

  const handleNestedChange = (parent, field, value) => {
    onChange({
      ...settings,
      [parent]: {
        ...settings[parent],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Model Selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-400">AI Model Selection</h3>
          <Tooltip text="Choose the AI model based on task complexity and performance needs">
            <FiInfo className="text-gray-400" />
          </Tooltip>
        </div>
        
        <select
          value={settings.model}
          onChange={(e) => handleChange('model', e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md px-3 py-2"
        >
          <option value="3B">3B (Fast, Simple Tasks)</option>
          <option value="7B">7B (Balanced Performance)</option>
          <option value="70B">70B (Detailed Analysis)</option>
        </select>

        <p className="text-gray-400 text-sm">
          Parameters are like tools in a toolbox - smaller models (3B) use fewer tools 
          for faster simple tasks, while larger models (70B) have more tools for 
          complex tasks.
        </p>
      </div>

      {/* Usage Limits */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-400">Usage Limits</h3>
          <Tooltip text="Set limits to manage resource consumption and prevent abuse">
            <FiInfo className="text-gray-400" />
          </Tooltip>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 text-sm block mb-2">Daily Token Limit</label>
            <input
              type="number"
              value={settings.dailyTokenLimit}
              onChange={(e) => handleChange('dailyTokenLimit', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-md px-3 py-2"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-2">Session Limit</label>
            <input
              type="number"
              value={settings.sessionLimit}
              onChange={(e) => handleChange('sessionLimit', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-md px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* External Resources */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-400">External Resources</h3>
          <Tooltip text="Control access to external datasets and APIs">
            <FiInfo className="text-gray-400" />
          </Tooltip>
        </div>
        
        <select
          value={settings.externalResources}
          onChange={(e) => handleChange('externalResources', e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md px-3 py-2"
        >
          <option value="allow-all">Allow All</option>
          <option value="deny-all">Deny All</option>
          <option value="approve-only">Approve Only</option>
        </select>
      </div>

      {/* Processing Rules */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-gray-400">Processing Rules</h3>
          <Tooltip text="Define rules for input/output handling">
            <FiInfo className="text-gray-400" />
          </Tooltip>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="text-gray-300 text-sm block mb-2">Pre-Processing Rules</label>
            <textarea
              value={settings.preProcessing}
              onChange={(e) => handleChange('preProcessing', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-md px-3 py-2 h-32"
              placeholder="Example: Remove sensitive data, format text..."
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm block mb-2">Post-Processing Rules</label>
            <textarea
              value={settings.postProcessing}
              onChange={(e) => handleChange('postProcessing', e.target.value)}
              className="w-full bg-gray-800 text-white rounded-md px-3 py-2 h-32"
              placeholder="Example: Add citations, remove hyperlinks..."
            />
          </div>
        </div>
      </div>

      {/* Copy-Paste Restriction */}
      <div className="flex items-center gap-4">
        <label className="text-gray-300">Copy-Paste Restriction</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={settings.copyPasteRestriction}
            onChange={(e) => handleChange('copyPasteRestriction', e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-700 rounded-full peer-checked:bg-yellow-500 transition-colors">
            <div className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-5"></div>
          </div>
        </label>
      </div>
    </div>
  );
};

export default AISettings;