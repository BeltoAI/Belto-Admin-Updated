import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer
} from 'recharts';

const radarData = [
  { subject: "Speed", "Llama 3": 95, "Zypher 7B": 75, "ChatGPT 3.5": 50 },
  { subject: "Accuracy", "Llama 3": 65, "Zypher 7B": 85, "ChatGPT 3.5": 95 },
  { subject: "Complexity", "Llama 3": 40, "Zypher 7B": 75, "ChatGPT 3.5": 100 },
  { subject: "Efficiency", "Llama 3": 90, "Zypher 7B": 80, "ChatGPT 3.5": 65 },
  { subject: "Resources", "Llama 3": 100, "Zypher 7B": 85, "ChatGPT 3.5": 60 },
  { subject: "Depth", "Llama 3": 55, "Zypher 7B": 80, "ChatGPT 3.5": 100 },
];

const ModelStatsChart = () => {
  return (
    <div className="bg-[#111111] rounded-xl p-4 md:p-6">
      <div className="grid grid-cols-2 md:flex gap-2 md:gap-4 mb-3 md:mb-4">
        {[
          { model: "Llama 3", color: "bg-yellow-400" },
          { model: "Zypher 7B", color: "bg-blue-400" },
          { model: "ChatGPT 3.5", color: "bg-purple-400" },
        ].map((item) => (
          <div key={item.model} className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${item.color}`} />
            <span className="text-gray-400 text-xs md:text-sm">{item.model}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 12 }} />
          <Radar name="Llama 3" dataKey="Llama 3" stroke="#facc15" fill="#facc15" fillOpacity={0.2} strokeWidth={1.5} />
          <Radar name="Zypher 7B" dataKey="Zypher 7B" stroke="#60a5fa" fill="#60a5fa" fillOpacity={0.2} strokeWidth={1.5} />
          <Radar name="ChatGPT 3.5" dataKey="ChatGPT 3.5" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={1.5} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ModelStatsChart;