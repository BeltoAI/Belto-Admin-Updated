"use client";

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Edit } from 'lucide-react';

// Import components
import ChatSection from './ChatSection';
import ModelSelection from './components/ModelSelection';
import UsageLimits from './components/UsageLimits';
import StoredContent from './components/StoredContent';
import ProcessingRules from './components/ProcessingRules';
import ModelStatsChart from './components/ModelStatsChart';
import CustomizeBehavior from './components/CustomizeBehavior';
import UpdateButton from './components/UpdateButton';
import EditLectureModal from './components/EditLectureModal';

const AIPreferences = () => {
  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
        <AIPreferencesContent />
      </Suspense>
    </div>
  );
};

function AIPreferencesContent() {
  const searchParams = useSearchParams();
  const lectureId = searchParams.get('lectureId');

  // State declarations with updated default model
  const [isUpdating, setIsUpdating] = useState(false);
  const [model, setModel] = useState('Llama 3');
  const [maxTokens, setMaxTokens] = useState('');
  const [numPrompts, setNumPrompts] = useState('');
  const [accessUrl, setAccessUrl] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [streaming, setStreaming] = useState(true);
  const [formatText, setFormatText] = useState('**text here**');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [tokenPredictionLimit, setTokenPredictionLimit] = useState('');
  const [processingRules, setProcessingRules] = useState({
    removeSensitiveData: true,
    allowUploads: true,
    formatText: true,
    removeHyperlinks: false,
    addCitations: false
  });  // Add system prompts state
  const [systemPrompts, setSystemPrompts] = useState([
    {
      name: 'Default Assistant',
      content: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses.'
    },
    {
      name: 'Technical Expert',
      content: 'You are a technical expert with deep knowledge of programming and software development. Provide detailed technical explanations and code examples when appropriate.'
    }
  ]);
    // State to trigger StoredContent refresh
  const [refreshStoredContent, setRefreshStoredContent] = useState(0);
  
  // Edit Lecture Modal state
  const [isEditLectureModalOpen, setIsEditLectureModalOpen] = useState(false);

  // Fetch lecture data - updated model mapping
  useEffect(() => {
    let isMounted = true;

    const fetchLectureData = async () => {
      if (!lectureId) return;
      try {
        const response = await fetch(`/api/lectures/${lectureId}`);
        const data = await response.json();
        if (data && isMounted) {
          // Map old model values to new model names if needed
          const modelMap = {
            '3B': 'Llama 3',
            '7B': 'Zypher 7B',
            '70B': 'ChatGPT 3.5'
          };

          setModel(modelMap[data.model] || data.model || 'Llama 3');
          setMaxTokens(data.maxTokens || '');
          setNumPrompts(data.numPrompts || '');
          setAccessUrl(data.accessUrl || '');
          setTemperature(data.temperature || 0.7);
          setStreaming(data.streaming ?? true);
          setFormatText(data.formatText || '**text here**');
          setCitationStyle(data.citationStyle || 'APA');
          setTokenPredictionLimit(data.tokenPredictionLimit || '');
          setProcessingRules(data.processingRules || {
            removeSensitiveData: true,
            allowUploads: true,
            formatText: true,
            removeHyperlinks: false,
            addCitations: false
          });
          // Load system prompts if available
          if (data.systemPrompts && data.systemPrompts.length > 0) {
            setSystemPrompts(data.systemPrompts);
          }
        }
      } catch (error) {
        console.error('Error fetching lecture:', error);
        toast.error('Failed to load lecture data');
      }
    };

    fetchLectureData();

    return () => {
      isMounted = false;
    };
  }, [lectureId]);

  // Fetch AI preferences - updated model mapping
  useEffect(() => {
    if (!lectureId) return;
    const fetchAIPreference = async () => {
      try {
        const res = await fetch(`/api/ai-preferences?lectureId=${lectureId}`);
        if (res.ok) {
          const data = await res.json();

          // Map old model values to new model names
          const modelMap = {
            '3B': 'Llama 3',
            '7B': 'Zypher 7B',
            '70B': 'ChatGPT 3.5'
          };

          setModel(modelMap[data.model] || data.model || 'Llama 3');
          setMaxTokens(data.maxTokens ? String(data.maxTokens) : "");
          setNumPrompts(data.numPrompts ? String(data.numPrompts) : "");
          setAccessUrl(data.accessUrl || "");
          setTemperature(data.temperature ?? 0.7);
          setStreaming(data.streaming ?? true);
          setFormatText(data.formatText || "**text here**");
          setCitationStyle(data.citationStyle || "APA");
          setTokenPredictionLimit(data.tokenPredictionLimit ? String(data.tokenPredictionLimit) : "");
          setProcessingRules(
            data.processingRules || {
              removeSensitiveData: true,
              allowUploads: true,
              formatText: true,
              removeHyperlinks: false,
              addCitations: false
            }
          );
          // Load system prompts if available
          if (data.systemPrompts && data.systemPrompts.length > 0) {
            setSystemPrompts(data.systemPrompts);
          }
        } else {
          // If not found, clear to defaults with new model name
          setModel("Llama 3");
          setMaxTokens("");
          setNumPrompts("");
          setAccessUrl("");
          setTemperature(0.7);
          setStreaming(true);
          setFormatText("**text here**");
          setCitationStyle("APA");
          setTokenPredictionLimit("");
          setProcessingRules({
            removeSensitiveData: true,
            allowUploads: true,
            formatText: true,
            removeHyperlinks: false,
            addCitations: false
          });
          // Set default system prompts
          setSystemPrompts([
            {
              name: 'Default Assistant',
              content: 'You are a helpful AI assistant. Provide clear, accurate, and concise responses.'
            },
            {
              name: 'Technical Expert',
              content: 'You are a technical expert with deep knowledge of programming and software development. Provide detailed technical explanations and code examples when appropriate.'
            }
          ]);
        }
      } catch (err) {
        console.error("Error fetching AI Preference:", err);
        toast.error("Failed to load AI preference");
      }
    };
    fetchAIPreference();
  }, [lectureId]);

  // Rest of the component remains the same
  const createAIPref = useCallback(async (prefData) => {
    try {
      const res = await fetch("/api/ai-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefData)
      });
      if (!res.ok) throw new Error("Error creating AI preference");
      toast.success("AI preference created");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create AI preference");
    }
  }, []);

  const updateAIPref = useCallback(async (updatedData) => {
    try {
      const res = await fetch("/api/ai-preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData)
      });
      if (!res.ok) throw new Error("Error updating AI preference");
      toast.success("AI preference updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update AI preference");
    }
  }, []);

  // Update the handleAIPrefUpsert function to handle both create and update

const handleAIPrefUpsert = useCallback(async () => {
  if (!lectureId) {
    toast.error("No lecture ID found");
    return;
  }
  
  setIsUpdating(true);
  
  try {
    // Format the data for submission
    const preferenceData = {
      lectureId,
      model,
      maxTokens: maxTokens ? parseInt(maxTokens) : undefined,
      numPrompts: numPrompts ? parseInt(numPrompts) : undefined,
      accessUrl,
      temperature: parseFloat(temperature),
      streaming,
      formatText,
      citationStyle,
      tokenPredictionLimit: tokenPredictionLimit ? parseInt(tokenPredictionLimit) : undefined,
      processingRules,
      systemPrompts,
    };
    
    // Check if preference already exists
    const res = await fetch(`/api/ai-preferences?lectureId=${lectureId}`);
    
    if (res.ok) {
      // Update existing preference
      const existingPref = await res.json();
      
      const updateRes = await fetch('/api/ai-preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...preferenceData,
          _id: existingPref._id
        })
      });
      
      if (updateRes.ok) {
        toast.success("AI preferences updated successfully");
      } else {
        const error = await updateRes.json();
        throw new Error(error.error || 'Failed to update preferences');
      }
    } else {
      // Create new preference
      const createRes = await fetch('/api/ai-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferenceData)
      });
      
      if (createRes.ok) {
        toast.success("AI preferences created successfully");
      } else {
        const error = await createRes.json();
        throw new Error(error.error || 'Failed to create preferences');
      }
    }
  } catch (error) {
    console.error("Error saving preferences:", error);
    toast.error(error.message || "Failed to save AI preferences");
  } finally {
    setIsUpdating(false);
  }
}, [
  lectureId,
  model,
  maxTokens,
  numPrompts,
  accessUrl,
  temperature,
  streaming,
  formatText,
  citationStyle,
  tokenPredictionLimit,
  processingRules,
  systemPrompts,
]);
  // Callback to refresh StoredContent when new content is added
  const handleContentAdded = useCallback((result) => {
    toast.success("Content added to lecture context successfully");
    setRefreshStoredContent(prev => prev + 1);
  }, []);

  // Handle lecture update
  const handleLectureUpdated = useCallback(() => {
    setRefreshStoredContent(prev => prev + 1);
  }, []);

  return (
    <>
      <ToastContainer position="top-right" theme="light" />      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-white">AI Preferences</h1>
        
        {/* Edit Lecture Button */}
        {lectureId && (
          <button
            onClick={() => setIsEditLectureModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
            Edit Lecture
          </button>
        )}
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Left Column */}
        <div className="space-y-4 md:space-y-6">
          <ModelSelection model={model} setModel={setModel} />          <UsageLimits
            maxTokens={maxTokens}
            setMaxTokens={setMaxTokens}
            numPrompts={numPrompts}
            setNumPrompts={setNumPrompts}
            accessUrl={accessUrl}
            setAccessUrl={setAccessUrl}
            onContentAdded={handleContentAdded}
          />
          <ProcessingRules
            processingRules={processingRules}
            setProcessingRules={setProcessingRules}
            formatText={formatText}
            setFormatText={setFormatText}
            citationStyle={citationStyle}
            setCitationStyle={setCitationStyle}
          />
        </div>        {/* Right Column */}
        <div className="space-y-4 md:space-y-6">
          <ModelStatsChart />
          <StoredContent refreshTrigger={refreshStoredContent} />
          <CustomizeBehavior
            temperature={temperature}
            setTemperature={setTemperature}
            streaming={streaming}
            setStreaming={setStreaming}
            tokenPredictionLimit={tokenPredictionLimit}
            setTokenPredictionLimit={setTokenPredictionLimit}
            systemPrompts={systemPrompts}
            setSystemPrompts={setSystemPrompts}
            lectureId={lectureId}
          />
        </div>
      </div>      <UpdateButton isUpdating={isUpdating} onUpdate={handleAIPrefUpsert} />

      {/* Chat Section is now imported as a separate component */}
      <ChatSection />
      
      {/* Edit Lecture Modal */}
      <EditLectureModal 
        isOpen={isEditLectureModalOpen}
        onClose={() => setIsEditLectureModalOpen(false)}
        lectureId={lectureId}
        onLectureUpdated={handleLectureUpdated}
      />
    </>
  );
}

export default AIPreferences;