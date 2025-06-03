import React, { useEffect, useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const ModelSelection = ({ model, setModel }) => {
  const [modelDetails, setModelDetails] = useState({
    description: '',
    scopeOfWork: '',
    restrictions: ''
  });

  // Update details when model changes
  useEffect(() => {
    switch (model) {
      case 'Llama 3':
        setModelDetails({
          description: 'Llama 3 is a lightweight, efficient AI model optimized for speed and basic tasks. It provides quick responses with lower computational requirements, making it ideal for simple queries and general information retrieval.',
          scopeOfWork: 'Best for straightforward Q&A, text completion, basic content generation, and simple data analysis tasks. Optimized for low-latency applications where speed is critical.',
          restrictions: 'Limited complex reasoning capabilities, shorter context windows, and reduced ability to handle nuanced queries. Best used for well-defined tasks with clear inputs.'
        });
        break;
        
      case 'Zypher 7B':
        setModelDetails({
          description: 'Zypher 7B offers a balanced approach, combining good performance with reasonable speed. This model provides deeper analysis than Llama 3 while maintaining acceptable response times.',
          scopeOfWork: 'Suitable for content creation, detailed explanations, structured data analysis, mid-complexity reasoning tasks, and contextual understanding. Handles multiple topics effectively.',
          restrictions: 'May face challenges with highly specialized technical content or extremely complex reasoning tasks. Moderate resource requirements for deployment.'
        });
        break;
        
      case 'ChatGPT 3.5':
        setModelDetails({
          description: 'ChatGPT 3.5 is our most advanced model, offering sophisticated reasoning, comprehensive analysis, and nuanced understanding. It excels at complex tasks requiring deep comprehension and contextual awareness.',
          scopeOfWork: 'Ideal for advanced content creation, detailed technical analysis, complex problem-solving, code generation, multi-step reasoning, and handling specialized domains with precision.',
          restrictions: 'Requires more computational resources and may have slightly longer response times. Higher token usage and processing costs compared to other models.'
        });
        break;
        
      default:
        setModelDetails({
          description: 'Select a model to view its capabilities and specifications.',
          scopeOfWork: 'Each model has different strengths and use cases.',
          restrictions: 'Model selection should be based on your specific requirements and constraints.'
        });
    }
  }, [model]);

  return (
    <div className="bg-[#111111] rounded-xl p-4 md:p-6">
      <div className="relative">
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="w-full bg-[#1a1a1a] text-white rounded-lg p-3 md:p-4 text-sm md:text-base appearance-none cursor-pointer"
        >
          <option value="Llama 3">Llama 3 - Fast & Simple Tasks</option>
          <option value="Zypher 7B">Zypher 7B - Balanced Performance</option>
          <option value="ChatGPT 3.5">ChatGPT 3.5 - Complex Analysis</option>
        </select>
        <FiChevronDown className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
      </div>
      <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
        <div>
          <h3 className="text-gray-400 text-sm md:text-base">Description:</h3>
          <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
            {modelDetails.description}
          </p>
        </div>
        <div>
          <h3 className="text-gray-400 text-sm md:text-base">Scope of Work:</h3>
          <p className="text-gray-500 text-xs md:text-sm">
            {modelDetails.scopeOfWork}
          </p>
        </div>
        <div>
          <h3 className="text-gray-400 text-sm md:text-base">Restrictions:</h3>
          <p className="text-gray-500 text-xs md:text-sm">
            {modelDetails.restrictions}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModelSelection;