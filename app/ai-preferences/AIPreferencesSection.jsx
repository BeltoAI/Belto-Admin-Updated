
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { FiChevronDown, FiPlus } from "react-icons/fi";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

const radarData = [
  { subject: "Speed", "3B": 95, "7B": 75, "70B": 50 },
  { subject: "Accuracy", "3B": 65, "7B": 85, "70B": 95 },
  { subject: "Complexity", "3B": 40, "7B": 75, "70B": 100 },
  { subject: "Efficiency", "3B": 90, "7B": 80, "70B": 65 },
  { subject: "Resources", "3B": 100, "7B": 85, "70B": 60 },
  { subject: "Depth", "3B": 55, "7B": 80, "70B": 100 },
];

export default function AIPreferencesSection({ lectureId }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [model, setModel] = useState("7B");
  const [maxTokens, setMaxTokens] = useState("");
  const [numPrompts, setNumPrompts] = useState("");
  const [accessUrl, setAccessUrl] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [streaming, setStreaming] = useState(true);
  const [formatText, setFormatText] = useState("**text here**");
  const [citationStyle, setCitationStyle] = useState("APA");
  const [tokenPredictionLimit, setTokenPredictionLimit] = useState("");
  const [processingRules, setProcessingRules] = useState({
    removeSensitiveData: true,
    allowUploads: true,
    formatText: true,
    removeHyperlinks: false,
    addCitations: false,
  });

  useEffect(() => {
    let isMounted = true;

    const fetchLectureData = async () => {
      if (!lectureId) return;
      try {
        const response = await fetch(`/api/lectures/${lectureId}`);
        const data = await response.json();
        if (data && isMounted) {
          setModel(data.model || "7B");
          setMaxTokens(data.maxTokens || "");
          setNumPrompts(data.numPrompts || "");
          setAccessUrl(data.accessUrl || "");
          setTemperature(data.temperature || 0.7);
          setStreaming(data.streaming ?? true);
          setFormatText(data.formatText || "**text here**");
          setCitationStyle(data.citationStyle || "APA");
          setTokenPredictionLimit(data.tokenPredictionLimit || "");
          setProcessingRules(
            data.processingRules || {
              removeSensitiveData: true,
              allowUploads: true,
              formatText: true,
              removeHyperlinks: false,
              addCitations: false,
            }
          );
        }
      } catch (error) {
        console.error("Error fetching lecture:", error);
        toast.error("Failed to load lecture data");
      }
    };

    fetchLectureData();

    return () => {
      isMounted = false;
    };
  }, [lectureId]);

  useEffect(() => {
    if (!lectureId) return;
    const fetchAIPreference = async () => {
      try {
        const res = await fetch(`/api/ai-preferences?lectureId=${lectureId}`);
        if (res.ok) {
          const data = await res.json();
          setModel(data.model || "7B");
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
              addCitations: false,
            }
          );
        } else {
          setModel("7B");
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
            addCitations: false,
          });
        }
      } catch (err) {
        console.error("Error fetching AI Preference:", err);
        toast.error("Failed to load AI preference");
      }
    };
    fetchAIPreference();
  }, [lectureId]);

  const createAIPref = useCallback(async (prefData) => {
    try {
      const res = await fetch("/api/ai-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefData),
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
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error("Error updating AI preference");
      toast.success("AI preference updated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update AI preference");
    }
  }, []);

  const handleAIPrefUpsert = useCallback(async () => {
    if (!lectureId) {
      toast.error("No lecture ID found");
      return;
    }
    try {
      const check = await fetch(`/api/ai-preferences?lectureId=${lectureId}`);
      if (check.ok) {
        const existingPref = await check.json();
        await updateAIPref({
          _id: existingPref._id,
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
        });
      } else {
        await createAIPref({
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
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upsert preference");
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
    updateAIPref,
    createAIPref,
  ]);

  return (
    <>
      <div className="flex justify-between items-center mb-4 md:mb-6">
        <h1 className="text-xl md:text-2xl font-semibold text-white">AI Preferences</h1>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-4 md:space-y-6">
          <div className="bg-[#111111] rounded-xl p-4 md:p-6">
            <div className="relative">
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-[#1a1a1a] text-white rounded-lg p-3 md:p-4 text-sm md:text-base appearance-none cursor-pointer"
              >
                <option value="3B">3B Model - Fast & Simple Tasks</option>
                <option value="7B">7B Model - Balanced Performance</option>
                <option value="70B">70B Model - Complex Analysis</option>
              </select>
              <FiChevronDown className="absolute right-3 md:right-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
            </div>
            <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
              <div>
                <h3 className="text-gray-400 text-sm md:text-base">Description:</h3>
                <p className="text-gray-500 text-xs md:text-sm mt-1 md:mt-2">
                  The AI model will utilize state-of-the-art deep learning techniques...
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm md:text-base">Scope of Work:</h3>
                <p className="text-gray-500 text-xs md:text-sm">
                  Data Collection and Preprocessing, Model Development, Deployment...
                </p>
              </div>
              <div>
                <h3 className="text-gray-400 text-sm md:text-base">Restrictions:</h3>
                <p className="text-gray-500 text-xs md:text-sm">
                  Data Ownership, Use Case Limitations, Accuracy and Limitations...
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 md:p-6">
            <h2 className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Usage Limits</h2>
            <div className="space-y-3 md:space-y-4">
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
              <div className="flex flex-col md:flex-row items-start md:items-center gap-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full" />
                <span className="text-gray-400 text-sm md:text-base min-w-[100px] md:w-40">Enable access to:</span>
                <input
                  type="text"
                  placeholder="enter URL here"
                  className="w-full bg-[#1a1a1a] text-white rounded-lg px-3 md:px-4 py-2 text-sm md:text-base"
                  value={accessUrl}
                  onChange={(e) => setAccessUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 md:p-6"></div>
            <h2 className="text-gray-300 mb-3 md:mb-4 text-sm md:text-base">Pre / Post Processing Rules</h2>
            <div className="space-y-3 md:space-y-4">
              {Object.entries(processingRules).map(([key, value]) => (
                <div key={key} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setProcessingRules((prev) => ({ ...prev, [key]: !value }))}
                    className="w-4 h-4 accent-yellow-400"
                  />
                  <span className="text-gray-300 text-sm md:text-base capitalize">
                    {key.replace(/([A-Z])/g, " $1").toLowerCase()}
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
        </div>

        <div className="space-y-4 md:space-y-6"></div>
          <div className="bg-[#111111] rounded-xl p-4 md:p-6">
            <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 mb-3 md:mb-4">
              {[
                { model: "3B", color: "bg-yellow-400" },
                { model: "7B", color: "bg-blue-400" },
                { model: "70B", color: "bg-purple-400" },
              ].map((item) => (
                <div key={item.model} className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${item.color}`} />
                  <span className="text-gray-400 text-xs md:text-sm">{item.model} Model</span>
                </div>
              ))}
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="#374151" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
                <Radar name="3B Model" dataKey="3B" stroke="#facc15" fill="#facc15" fillOpacity={0.2} strokeWidth={1.5} />
                <Radar name="7B Model" dataKey="7B" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} strokeWidth={1.5} />
                <Radar name="70B Model" dataKey="70B" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={1.5} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-[#111111] rounded-xl p-4 md:p-6"></div>
            <h2 className="text-gray-300 mb-4 md:mb-6 text-sm md:text-base">Customize AI Behavior</h2>
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
                <button className="flex items-center gap-2 text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base">
                  <span>Change System Prompts</span>
                  <FiChevronDown className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
                <button className="flex items-center gap-2 text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base">
                  <span>Add System Prompts</span>
                  <FiPlus className="ml-1 md:ml-2 w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
                <button className="text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base">
                  Delete
                </button>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
                <button className="text-yellow-400 border border-gray-700 rounded-md px-3 md:px-4 py-1.5 md:py-2 text-sm md:text-base">
                  View
                </button>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="w-3 h-3 bg-yellow-400 rounded-full mt-1" />
                <span className="text-white min-w-[120px] text-sm md:text-base">Temperature</span>
                <div className="flex-1 flex items-center gap-2 md:gap-4 w-full">
                  <input
                    type="range"
                    min="0"
                    max="1"
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
      <div className="flex justify-end gap-2 mt-8">
        <button
          onClick={handleAIPrefUpsert}
          disabled={isUpdating}
          className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isUpdating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Update Preference"
          )}
        </button>
      </div>
    </>
  );
}