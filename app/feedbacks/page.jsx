'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ComposedChart,
  Bar
} from 'recharts';
import { FaSmile, FaMeh, FaFrown, FaStar, FaRegStar, FaSearch, FaAngleDown, FaCalendarAlt } from 'react-icons/fa';
import { useSearchParams } from 'next/navigation';

const getSentimentColor = (score) => {
  if (score >= 1.5) return 'bg-green-500 text-white';
  if (score >= 0.5) return 'bg-green-400 text-black';
  if (score >= -0.4) return 'bg-yellow-400 text-black';
  if (score >= -1.9) return 'bg-red-400 text-white';
  return 'bg-red-500 text-white';
};

const getSentimentBorderColor = (score) => {
  if (score >= 1.5) return 'border-green-500';
  if (score >= 0.5) return 'border-green-400';
  if (score >= -0.4) return 'border-yellow-400';
  if (score >= -1.9) return 'border-red-400';
  return 'border-red-500';
};

const getSentimentBgColor = (score) => {
  if (score >= 1.5) return 'bg-gray-800';
  if (score >= 0.5) return 'bg-gray-800';
  if (score >= -0.4) return 'bg-gray-800';
  if (score >= -1.9) return 'bg-gray-800';
  return 'bg-gray-800';
};

const getSentimentIcon = (score) => {
  if (score >= 0.5) return <FaSmile className="text-green-500 text-2xl" />;
  if (score >= -0.4) return <FaMeh className="text-yellow-400 text-2xl" />;
  return <FaFrown className="text-red-500 text-2xl" />;
};

const getSentimentLabel = (score) => {
  if (score >= 2.0) return 'Very Positive';
  if (score >= 0.5) return 'Positive';
  if (score >= -0.4) return 'Neutral';
  if (score >= -1.9) return 'Negative';
  return 'Very Negative';
};

const getProgressBarWidth = (score) => {
  return Math.min(100, Math.max(0, ((score + 3) * 100) / 6));
};

const getProgressBarColor = (score) => {
  if (score >= 0.5) return 'bg-green-500';
  if (score >= -0.4) return 'bg-yellow-400';
  return 'bg-red-500';
};

// Message Item component remains the same
const MessageItem = ({ message }) => {
  return (
    <div 
      className={`mb-3 p-4 rounded-md ${
        message.isBot 
          ? 'border-l-4 border-blue-500 bg-gray-800/40' 
          : `border-l-4 ${getSentimentBorderColor(message.sentiment)} ${getSentimentBgColor(message.sentiment)}`
      }`}
    >
      <div className="flex justify-between">
        <div className="flex items-center">
          {message.isBot && <span className="text-blue-400 text-xs mr-2 px-2 py-1 rounded-full bg-blue-900/30">AI</span>}
          <p className="text-gray-300">{message.text}</p>
        </div>
        {!message.isBot && (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSentimentColor(message.sentiment)}`}>
            {getSentimentLabel(message.sentiment)}
          </span>
        )}
      </div>
      
      {!message.isBot && (
        <>
          <div className="mt-2 text-sm text-gray-400 flex space-x-4">
            <span>Score: {message.sentiment.toFixed(1)}</span>
            <span>Comparative: {message.comparative.toFixed(2)}</span>
          </div>
          <div className="mt-2">
            {message.nouns?.length > 0 && (
              <div className="mb-1">
                <span className="text-gray-400 text-sm mr-2">Topics:</span>
                {message.nouns.map((noun, index) => (
                  <span key={index} className="inline-block bg-gray-700 text-blue-300 text-xs px-2 py-1 rounded-full mr-1">
                    {noun}
                  </span>
                ))}
              </div>
            )}
            {message.verbs?.length > 0 && (
              <div className="mb-1">
                <span className="text-gray-400 text-sm mr-2">Actions:</span>
                {message.verbs.map((verb, index) => (
                  <span key={index} className="inline-block bg-gray-700 text-purple-300 text-xs px-2 py-1 rounded-full mr-1">
                    {verb}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {message.positiveWords?.length > 0 && (
                <div>
                  <span className="text-gray-400 text-sm mr-2">Positive:</span>
                  {message.positiveWords.map((word, index) => (
                    <span key={index} className="inline-block bg-gray-700 text-green-300 text-xs px-2 py-1 rounded-full mr-1">
                      {word}
                    </span>
                  ))}
                </div>
              )}
              {message.negativeWords?.length > 0 && (
                <div>
                  <span className="text-gray-400 text-sm mr-2">Negative:</span>
                  {message.negativeWords.map((word, index) => (
                    <span key={index} className="inline-block bg-gray-700 text-red-300 text-xs px-2 py-1 rounded-full mr-1">
                      {word}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Lecture Detail View component remains the same
const LectureDetailView = ({ lecture }) => {
  return (
    <div className="mt-6">
      <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-700 flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-300">{lecture.title}</h3>
          <span className="text-gray-400">{lecture.date}</span>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Overall Sentiment</h4>
              <div className="flex items-center">
                <div className="mr-3">
                  {getSentimentIcon(lecture.sentimentScore)}
                </div>
                <div>
                  <p className="font-medium text-gray-300">{getSentimentLabel(lecture.sentimentScore)}</p>
                  <p className="text-sm text-gray-300">Score: {lecture.sentimentScore.toFixed(1)}</p>
                  <p className="text-xs text-gray-400">Comparative: {lecture.comparative.toFixed(2)}</p>
                </div>
              </div>
            </div>
            
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Key Topics</h4>
              <div className="flex flex-wrap gap-1">
                {lecture.keyTopics?.map((topic, index) => (
                  <span key={index} className="inline-block bg-gray-700 text-blue-300 text-xs px-2 py-1 rounded-full">
                    {topic}
                  </span>
                ))}
              </div>
            </div>
            
            <div className="bg-[#111111] rounded-lg p-4 border border-gray-700">
              <h4 className="text-sm font-medium text-gray-400 mb-3">Key Actions</h4>
              <div className="flex flex-wrap gap-1">
                {lecture.keyVerbs?.map((verb, index) => (
                  <span key={index} className="inline-block bg-gray-700 text-purple-300 text-xs px-2 py-1 rounded-full">
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-lg font-medium text-gray-300 mb-4 pb-2 border-b border-gray-700">Message Breakdown</h4>
            <div>
              {lecture.messages?.map(message => (
                <MessageItem key={message.id} message={message} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// New component for displaying star ratings
const StarRating = ({ rating }) => {
  return (
    <div className="flex items-center">
      {[1, 2, 3, 4, 5].map((star) => (
        <span key={star}>
          {star <= rating ? (
            <FaStar className="text-yellow-400 text-lg" />
          ) : (
            <FaRegStar className="text-gray-500 text-lg" />
          )}
        </span>
      ))}
    </div>
  );
};

// New component for displaying individual feedback items
const FeedbackItem = ({ feedback }) => {
  const date = new Date(feedback.createdAt).toLocaleDateString();
  
  return (
    <div className="bg-[#1C1C1C] rounded-lg p-4 mb-4 border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-200">{feedback.studentId.username}</h4>
          <p className="text-sm text-gray-400">{feedback.studentId.email}</p>
        </div>
        <p className="text-sm text-gray-400">{date}</p>
      </div>
      
      <div className="mb-3">
        <StarRating rating={feedback.rating} />
      </div>
      
      <p className="text-gray-300">{feedback.review}</p>
    </div>
  );
};

// New component for displaying general feedback items
const GeneralFeedbackItem = ({ feedback }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const date = new Date(feedback.createdAt).toLocaleDateString();
  
  return (
    <div className="bg-[#1C1C1C] rounded-lg p-4 mb-4 border border-gray-700">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-medium text-gray-200">{feedback.email}</h4>
          <p className="text-sm text-gray-400">{date}</p>
        </div>
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-400 hover:text-gray-300"
        >
          <FaAngleDown className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </button>
      </div>
      
      <div className={`space-y-3 transition-all duration-300 ${isExpanded ? 'max-h-96' : 'max-h-24 overflow-hidden'}`}>
        <div>
          <h5 className="text-sm font-medium text-yellow-400 mb-1">Helpfulness</h5>
          <p className="text-gray-300 text-sm">{feedback.q1_helpfulness}</p>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-red-400 mb-1">Frustrations</h5>
          <p className="text-gray-300 text-sm">{feedback.q2_frustrations}</p>
        </div>
        
        <div>
          <h5 className="text-sm font-medium text-blue-400 mb-1">Suggested Improvements</h5>
          <p className="text-gray-300 text-sm">{feedback.q3_improvement}</p>
        </div>
      </div>
      
      {!isExpanded && (
        <button 
          onClick={() => setIsExpanded(true)}
          className="mt-2 text-xs text-yellow-500 hover:text-yellow-400"
        >
          Read more...
        </button>
      )}
    </div>
  );
};

const SentimentTrendsChart = ({ data, timeRange }) => {
  return (
    <div className="w-full h-96">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis domain={[-3, 3]} label={{ value: 'Sentiment Score', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} stroke="#9CA3AF" />
          <RechartsTooltip 
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
            formatter={(value, name, props) => {
              return [
                `Score: ${value.toFixed(2)}`, 
                `Sentiment: ${getSentimentLabel(value)}`,
                `Topic: ${props.payload.topic || 'N/A'}`
              ];
            }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Line 
            type="monotone" 
            dataKey="sentiment" 
            stroke="#EAB308" 
            activeDot={{ r: 8, fill: "#EAB308" }} 
            name="Sentiment Score"
            dot={{ fill: '#EAB308' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

// New component for sentiment distribution chart
const SentimentDistributionChart = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="name" stroke="#9CA3AF" />
          <YAxis label={{ value: 'Count', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }} stroke="#9CA3AF" />
          <RechartsTooltip
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Bar dataKey="count" name="Message Count" fill="#4B5563" />
          <Line
            type="monotone"
            dataKey="avgScore"
            name="Avg. Sentiment"
            stroke="#EAB308"
            activeDot={{ r: 8, fill: "#EAB308" }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};

// New component for sentiment area chart
const SentimentAreaChart = ({ data }) => {
  return (
    <div className="w-full h-72">
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis dataKey="date" stroke="#9CA3AF" />
          <YAxis stroke="#9CA3AF" />
          <RechartsTooltip
            contentStyle={{ backgroundColor: '#1F2937', borderColor: '#374151', color: '#F3F4F6' }}
          />
          <Legend wrapperStyle={{ color: '#9CA3AF' }} />
          <Area 
            type="monotone" 
            dataKey="positive" 
            stackId="1" 
            stroke="#10B981" 
            fill="#10B981" 
            name="Positive"
          />
          <Area 
            type="monotone" 
            dataKey="neutral" 
            stackId="1" 
            stroke="#F59E0B" 
            fill="#F59E0B" 
            name="Neutral"
          />
          <Area 
            type="monotone" 
            dataKey="negative" 
            stackId="1" 
            stroke="#EF4444" 
            fill="#EF4444" 
            name="Negative"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Create a client component that uses searchParams
function FeedbacksContent() {
  const searchParams = useSearchParams();
  const [classId, setClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('lecture-sessions');
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [lectureData, setLectureData] = useState([]);
  const [timeSeriesData, setTimeSeriesData] = useState([]);
  const [sentimentFilter, setSentimentFilter] = useState('all');
  const [error, setError] = useState(null);
  
  // Class feedbacks states
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbacksLoading, setFeedbacksLoading] = useState(false);
  const [feedbacksError, setFeedbacksError] = useState(null);
  const [averageRating, setAverageRating] = useState(0);
  
  // General feedbacks states
  const [generalFeedbacks, setGeneralFeedbacks] = useState([]);
  const [generalFeedbacksLoading, setGeneralFeedbacksLoading] = useState(false);
  const [generalFeedbacksError, setGeneralFeedbacksError] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Sentiment graph states
  const [sentimentGraphData, setSentimentGraphData] = useState([]);
  const [distributionData, setDistributionData] = useState([]);
  const [areaChartData, setAreaChartData] = useState([]);
  const [timeRange, setTimeRange] = useState('7d');
  const [graphLoading, setGraphLoading] = useState(false);
  
  useEffect(() => {
    const params = searchParams;
    setClassId(params?.get('classId'));
  }, [searchParams]);

  useEffect(() => {
    const fetchData = async () => {
      if (!classId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      
      try {
        console.log('Fetching data for class ID:', classId);
        const response = await fetch(`/api/chat-sessions/class/${classId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          setLectureData(result.data);
          setTimeSeriesData(result.timeSeriesData || []);
          
          if (result.data.length > 0) {
            setSelectedLecture(result.data[0]);
          }
          
          // Process data for sentiment graphs
          processSentimentData(result.data);
        } else {
          throw new Error(result.error || 'Unknown error');
        }
      } catch (err) {
        console.error('Failed to fetch feedback data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [classId]);

  // Effect for fetching sentiment graph data
  useEffect(() => {
    const fetchSentimentGraphData = async () => {
      if (!classId || activeTab !== 'sentiment-graph') {
        return;
      }

      setGraphLoading(true);
      
      try {
        // In a real app, you would fetch data from an API based on timeRange
        // For now, we'll simulate it by processing the existing data
        console.log(`Fetching sentiment graph data for time range: ${timeRange}`);
        
        // If we have lecture data, process it based on time range
        if (lectureData.length > 0) {
          processSentimentDataByTimeRange(lectureData, timeRange);
        } else {
          // Create some example data
          generateMockSentimentData(timeRange);
        }
      } catch (err) {
        console.error('Failed to fetch sentiment graph data:', err);
      } finally {
        setGraphLoading(false);
      }
    };
    
    fetchSentimentGraphData();
  }, [classId, activeTab, timeRange, lectureData]);

  // Function to generate mock data for sentiment graphs
  const generateMockSentimentData = (range) => {
    // Generate time series data
    const now = new Date();
    const data = [];
    let days;
    
    switch (range) {
      case '7d':
        days = 7;
        break;
      case '1m':
        days = 30;
        break;
      case '3m':
        days = 90;
        break;
      case '1y':
        days = 365;
        break;
      default:
        days = 7;
    }
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));
      
      const sentiment = Math.random() * 4 - 2; // Random score between -2 and 2
      
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sentiment: sentiment,
        topic: ['AI', 'Math', 'Programming', 'Physics', 'Chemistry'][Math.floor(Math.random() * 5)]
      });
    }
    
    setSentimentGraphData(data);
    
    // Generate distribution data
    const distribution = [
      { name: 'Very Positive', count: Math.floor(Math.random() * 30) + 5, avgScore: 2.3 },
      { name: 'Positive', count: Math.floor(Math.random() * 50) + 20, avgScore: 1.2 },
      { name: 'Neutral', count: Math.floor(Math.random() * 70) + 40, avgScore: 0 },
      { name: 'Negative', count: Math.floor(Math.random() * 30) + 10, avgScore: -1.0 },
      { name: 'Very Negative', count: Math.floor(Math.random() * 15) + 2, avgScore: -2.2 },
    ];
    
    setDistributionData(distribution);
    
    // Generate area chart data
    const areaData = [];
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now);
      date.setDate(date.getDate() - (days - i));
      
      // Random distribution that adds up to 100%
      const positive = Math.floor(Math.random() * 40) + 20;
      const negative = Math.floor(Math.random() * 30) + 10;
      const neutral = 100 - positive - negative;
      
      areaData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        positive: positive,
        neutral: neutral,
        negative: negative
      });
    }
    
    setAreaChartData(areaData);
  };

  // Function to process sentiment data from lecture data
  const processSentimentData = (data) => {
    if (!data || data.length === 0) return;
    
    // Process time series data
    const timeSeriesData = data.map(lecture => ({
      date: lecture.date,
      sentiment: lecture.sentimentScore,
      topic: lecture.keyTopics?.[0] || 'N/A'
    }));
    
    setSentimentGraphData(timeSeriesData);
    
    // Process distribution data
    const distribution = [
      { name: 'Very Positive', count: 0, avgScore: 0, totalScore: 0 },
      { name: 'Positive', count: 0, avgScore: 0, totalScore: 0 },
      { name: 'Neutral', count: 0, avgScore: 0, totalScore: 0 },
      { name: 'Negative', count: 0, avgScore: 0, totalScore: 0 },
      { name: 'Very Negative', count: 0, avgScore: 0, totalScore: 0 },
    ];
    
    data.forEach(lecture => {
      const score = lecture.sentimentScore;
      let category;
      
      if (score >= 2.0) category = 0; // Very Positive
      else if (score >= 0.5) category = 1; // Positive
      else if (score >= -0.4) category = 2; // Neutral
      else if (score >= -1.9) category = 3; // Negative
      else category = 4; // Very Negative
      
      distribution[category].count++;
      distribution[category].totalScore += score;
    });
    
    // Calculate average scores
    distribution.forEach(item => {
      if (item.count > 0) {
        item.avgScore = item.totalScore / item.count;
      }
      delete item.totalScore; // Remove helper property
    });
    
    setDistributionData(distribution);
    
    // Process area chart data (we need more data points for a good area chart)
    // For now, let's generate some data based on the lectures
    const areaData = [];
    
    // Group by date
    const dateGroups = {};
    data.forEach(lecture => {
      if (!dateGroups[lecture.date]) {
        dateGroups[lecture.date] = {
          positive: 0,
          neutral: 0,
          negative: 0,
          total: 0
        };
      }
      
      const score = lecture.sentimentScore;
      dateGroups[lecture.date].total++;
      
      if (score >= 0.5) dateGroups[lecture.date].positive++;
      else if (score >= -0.4) dateGroups[lecture.date].neutral++;
      else dateGroups[lecture.date].negative++;
    });
    
    // Convert to array and calculate percentages
    Object.entries(dateGroups).forEach(([date, counts]) => {
      areaData.push({
        date,
        positive: Math.round((counts.positive / counts.total) * 100),
        neutral: Math.round((counts.neutral / counts.total) * 100),
        negative: Math.round((counts.negative / counts.total) * 100)
      });
    });
    
    setAreaChartData(areaData);
  };

  // Function to filter sentiment data by time range
  const processSentimentDataByTimeRange = (data, range) => {
    if (!data || data.length === 0) return;
    
    const now = new Date();
    let cutoffDate;
    
    switch (range) {
      case '7d':
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case '1m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case '3m':
        cutoffDate = new Date(now.setMonth(now.getMonth() - 3));
        break;
      case '1y':
        cutoffDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        cutoffDate = new Date(now.setDate(now.getDate() - 7));
    }
    
    // Filter data by cutoff date
    // In a real app, you would parse the date strings to Date objects
    // Here we're just simulating the behavior by using the existing data
    
    // For now, let's just use the existing process function
    // In a real app, you would filter by date first
    processSentimentData(data);
  };

  // Effect for fetching class-specific feedback data
  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (!classId || activeTab !== 'feedbacks') {
        return;
      }

      setFeedbacksLoading(true);
      setFeedbacksError(null);
      
      try {
        const response = await fetch(`/api/feedback?classId=${classId}`);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('Feedbacks data:', result);
        
        if (result.feedbacks) {
          setFeedbacks(result.feedbacks);
          
          // Calculate average rating
          if (result.feedbacks.length > 0) {
            const totalRating = result.feedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
            setAverageRating(totalRating / result.feedbacks.length);
          }
        } else {
          setFeedbacks([]);
          setAverageRating(0);
        }
      } catch (err) {
        console.error('Failed to fetch feedbacks:', err);
        setFeedbacksError(err.message);
      } finally {
        setFeedbacksLoading(false);
      }
    };
    
    fetchFeedbacks();
  }, [classId, activeTab]);

  // New effect for fetching general feedback data
  useEffect(() => {
    const fetchGeneralFeedbacks = async () => {
      if (activeTab !== 'general-feedbacks') {
        return;
      }

      setGeneralFeedbacksLoading(true);
      setGeneralFeedbacksError(null);
      
      try {
        let url = `/api/general-feedback?page=${currentPage}`;
        
        if (searchEmail) {
          url += `&email=${encodeURIComponent(searchEmail)}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }
        
        const result = await response.json();
        console.log('General feedbacks data:', result);
        
        if (result.generalFeedbacks) {
          setGeneralFeedbacks(result.generalFeedbacks);
          setTotalPages(result.pagination.totalPages);
        } else {
          setGeneralFeedbacks([]);
        }
      } catch (err) {
        console.error('Failed to fetch general feedbacks:', err);
        setGeneralFeedbacksError(err.message);
      } finally {
        setGeneralFeedbacksLoading(false);
      }
    };
    
    fetchGeneralFeedbacks();
  }, [activeTab, currentPage, searchEmail]);

  // Handle email search
  const handleEmailSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page on new search
    // The useEffect will automatically trigger a new search
  };

  const filteredLectures = lectureData.filter(lecture => {
    if (sentimentFilter === 'all') return true;
    if (sentimentFilter === 'positive' && lecture.sentimentScore >= 0.5) return true;
    if (sentimentFilter === 'neutral' && lecture.sentimentScore >= -0.4 && lecture.sentimentScore < 0.5) return true;
    if (sentimentFilter === 'negative' && lecture.sentimentScore < -0.4) return true;
    return false;
  });

  return (
    <div className="min-h-screen w-full bg-black">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold text-white">Feedback Analysis</h1>
        <p className="text-gray-400 mt-1">
          Monitor student engagement, sentiment and general feedback
        </p>
        
        <div className="mt-6 border-b border-gray-700">
          <div className="flex space-x-8 overflow-x-auto pb-1 scrollbar-hide">
            <button
              className={`pb-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'lecture-sessions'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('lecture-sessions')}
            >
              Lecture Sessions
            </button>
            <button
              className={`pb-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'sentiment-graph'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('sentiment-graph')}
            >
              Sentiment Graph
            </button>
            <button
              className={`pb-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'feedbacks'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('feedbacks')}
            >
              Class Feedbacks
            </button>
            <button
              className={`pb-4 font-medium text-sm whitespace-nowrap ${
                activeTab === 'general-feedbacks'
                  ? 'text-yellow-400 border-b-2 border-yellow-400'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              onClick={() => setActiveTab('general-feedbacks')}
            >
              General Feedbacks
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mt-6 p-4 bg-red-900/30 border border-red-700 rounded-md">
            <p className="text-red-400">{error}</p>
            <p className="text-sm text-red-300 mt-1">Please try refreshing the page or contact support.</p>
          </div>
        )}
        
        {!classId && !error && activeTab !== 'general-feedbacks' && (
          <div className="mt-6 p-4 bg-yellow-900/30 border border-yellow-700 rounded-md">
            <p className="text-yellow-400">No class ID provided in the URL.</p>
            <p className="text-sm text-yellow-300 mt-1">Please add a classId parameter to the URL (e.g., /feedbacks?classId=YOUR_CLASS_ID).</p>
          </div>
        )}
        
        {/* Lecture Sessions Tab Content */}
        {activeTab === 'lecture-sessions' && (
          <div className="mt-6">
            {/* Keep the existing lecture sessions content */}
            <div className="mb-6">
              <select 
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-gray-300 focus:outline-none focus:border-yellow-500 text-sm"
                value={sentimentFilter}
                onChange={(e) => setSentimentFilter(e.target.value)}
              >
                <option value="all">All Sentiments</option>
                <option value="positive">Positive</option>
                <option value="neutral">Neutral</option>
                <option value="negative">Negative</option>
              </select>
            </div>
            
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
              </div>
            ) : filteredLectures.length === 0 ? (
              <div className="bg-[#1C1C1C] rounded-lg p-8 text-center">
                <p className="text-gray-400">No lecture data available{sentimentFilter !== 'all' ? ' for the selected sentiment filter' : ''}</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto mt-4">
                  <table className="min-w-full bg-[#1C1C1C] rounded-lg overflow-hidden">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Lecture
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Sentiment
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Score
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Key Topics
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {filteredLectures.map((lecture) => (
                        <tr 
                          key={lecture.id} 
                          onClick={() => setSelectedLecture(lecture)}
                          className="hover:bg-gray-800 cursor-pointer"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">
                            {lecture.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {lecture.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center" title={`Score: ${lecture.sentimentScore.toFixed(1)}`}>
                              {getSentimentIcon(lecture.sentimentScore)}
                              <span className="ml-2 text-sm text-gray-300">{getSentimentLabel(lecture.sentimentScore)}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="w-full bg-gray-700 rounded-full h-2.5">
                              <div 
                                className={`h-2.5 rounded-full ${getProgressBarColor(lecture.sentimentScore)}`} 
                                style={{ width: `${getProgressBarWidth(lecture.sentimentScore)}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400 mt-1">{lecture.sentimentScore.toFixed(1)}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex flex-wrap gap-1">
                              {lecture.keyTopics?.slice(0, 3).map((topic, index) => (
                                <span key={index} className="inline-block bg-gray-700 text-blue-300 text-xs px-2 py-1 rounded-full">
                                  {topic}
                                </span>
                              ))}
                              {lecture.keyTopics?.length > 3 && (
                                <span className="inline-block bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-full">
                                  +{lecture.keyTopics.length - 3}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {selectedLecture && <LectureDetailView lecture={selectedLecture} />}
              </>
            )}
          </div>
        )}
        
        {/* Sentiment Graph Tab Content */}
        {activeTab === 'sentiment-graph' && (
          <div className="mt-6">
            <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
                  <h3 className="text-xl font-semibold text-gray-300 mb-2 sm:mb-0">Sentiment Analysis Over Time</h3>
                  <div className="inline-flex bg-gray-800 rounded-md">
                    <button
                      onClick={() => setTimeRange('7d')}
                      className={`px-3 py-1 text-sm font-medium rounded-l-md ${
                        timeRange === '7d' 
                          ? 'bg-yellow-500 text-black' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      7d
                    </button>
                    <button
                      onClick={() => setTimeRange('1m')}
                      className={`px-3 py-1 text-sm font-medium ${
                        timeRange === '1m' 
                          ? 'bg-yellow-500 text-black' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      1m
                    </button>
                    <button
                      onClick={() => setTimeRange('3m')}
                      className={`px-3 py-1 text-sm font-medium ${
                        timeRange === '3m' 
                          ? 'bg-yellow-500 text-black' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      3m
                    </button>
                    <button
                      onClick={() => setTimeRange('1y')}
                      className={`px-3 py-1 text-sm font-medium rounded-r-md ${
                        timeRange === '1y' 
                          ? 'bg-yellow-500 text-black' 
                          : 'text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      1y
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                {graphLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                      <div className="bg-[#111111] rounded-lg p-4 border border-gray-700 col-span-1">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Sentiment Summary</h4>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                              <span className="text-gray-300 text-sm">Positive</span>
                            </div>
                            <span className="text-gray-300 text-sm">
                              {distributionData.filter(d => d.name.includes('Positive')).reduce((acc, d) => acc + d.count, 0)} messages
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-yellow-400 mr-2"></div>
                              <span className="text-gray-300 text-sm">Neutral</span>
                            </div>
                            <span className="text-gray-300 text-sm">
                              {distributionData.filter(d => d.name === 'Neutral').reduce((acc, d) => acc + d.count, 0)} messages
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                              <span className="text-gray-300 text-sm">Negative</span>
                            </div>
                            <span className="text-gray-300 text-sm">
                              {distributionData.filter(d => d.name.includes('Negative')).reduce((acc, d) => acc + d.count, 0)} messages
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#111111] rounded-lg p-4 border border-gray-700 col-span-1">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Sentiment Stats</h4>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">Average Sentiment Score</h5>
                            <p className="text-xl text-yellow-400 font-medium">
                              {sentimentGraphData.length > 0 
                                ? (sentimentGraphData.reduce((acc, d) => acc + d.sentiment, 0) / sentimentGraphData.length).toFixed(2)
                                : "N/A"}
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">Total Messages Analyzed</h5>
                            <p className="text-xl text-gray-300">
                              {distributionData.reduce((acc, d) => acc + d.count, 0)}
                            </p>
                          </div>
                          
                          <div>
                            <h5 className="text-xs font-medium text-gray-400">Time Range</h5>
                            <p className="text-md text-gray-300 flex items-center">
                              <FaCalendarAlt className="text-gray-400 mr-2" />
                              {timeRange === '7d' ? 'Last 7 Days' : 
                               timeRange === '1m' ? 'Last Month' :
                               timeRange === '3m' ? 'Last 3 Months' : 'Last Year'}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-[#111111] rounded-lg p-4 border border-gray-700 col-span-1">
                        <h4 className="text-sm font-medium text-gray-400 mb-3">Top Sentiments</h4>
                        {distributionData.length > 0 ? (
                          <div className="space-y-3">
                            {distributionData
                              .sort((a, b) => b.count - a.count)
                              .slice(0, 3)
                              .map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <div className={`w-3 h-3 rounded-full mr-2 ${
                                      item.name.includes('Positive') ? 'bg-green-500' :
                                      item.name === 'Neutral' ? 'bg-yellow-400' : 'bg-red-500'
                                    }`}></div>
                                    <span className="text-gray-300 text-sm">{item.name}</span>
                                  </div>
                                  <span className="text-gray-300 text-sm">{item.count} ({Math.round((item.count / distributionData.reduce((acc, d) => acc + d.count, 0)) * 100)}%)</span>
                                </div>
                              ))}
                          </div>
                        ) : (
                          <p className="text-gray-400 text-center py-4">No data available</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="mb-8">
                      <h4 className="text-lg font-medium text-gray-300 mb-4">Sentiment Trend Over Time</h4>
                      {sentimentGraphData.length > 0 ? (
                        <div className="bg-[#111111] rounded-lg p-4 border border-gray-700">
                          <SentimentTrendsChart data={sentimentGraphData} timeRange={timeRange} />
                        </div>
                      ) : (
                        <div className="bg-[#111111] rounded-lg p-8 border border-gray-700 text-center">
                          <p className="text-gray-400">No sentiment trend data available</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-lg font-medium text-gray-300 mb-4">Sentiment Distribution</h4>
                        {distributionData.length > 0 ? (
                          <div className="bg-[#111111] rounded-lg p-4 border border-gray-700">
                            <SentimentDistributionChart data={distributionData} />
                          </div>
                        ) : (
                          <div className="bg-[#111111] rounded-lg p-8 border border-gray-700 text-center">
                            <p className="text-gray-400">No distribution data available</p>
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-medium text-gray-300 mb-4">Sentiment Breakdown</h4>
                        {areaChartData.length > 0 ? (
                          <div className="bg-[#111111] rounded-lg p-4 border border-gray-700">
                            <SentimentAreaChart data={areaChartData} />
                          </div>
                        ) : (
                          <div className="bg-[#111111] rounded-lg p-8 border border-gray-700 text-center">
                            <p className="text-gray-400">No breakdown data available</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* Class-specific Feedbacks Tab Content */}
        {activeTab === 'feedbacks' && (
          <div className="mt-6">
            <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-gray-300">Student Feedbacks</h3>
              </div>
              
              <div className="p-6">
                {feedbacksLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : feedbacksError ? (
                  <div className="bg-red-900/30 border border-red-700 rounded-md p-4">
                    <p className="text-red-400">{feedbacksError}</p>
                    <p className="text-sm text-red-300 mt-1">Please try refreshing the page or contact support.</p>
                  </div>
                ) : feedbacks.length === 0 ? (
                  <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No feedback data available for this class.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-700 mb-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Overall Rating</h4>
                      <div className="flex items-center space-x-4">
                        <StarRating rating={Math.round(averageRating)} />
                        <p className="text-yellow-400 font-medium">
                          {averageRating.toFixed(1)} / 5
                        </p>
                        <p className="text-gray-400">
                          ({feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'})
                        </p>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-300 mb-4">Student Reviews</h4>
                    <div className="space-y-4">
                      {feedbacks.map((feedback) => (
                        <FeedbackItem key={feedback._id} feedback={feedback} />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {/* General Feedbacks Tab Content */}
        {activeTab === 'general-feedbacks' && (
          <div className="mt-6">
            <div className="bg-[#1C1C1C] rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-gray-300">General AI Feedbacks</h3>
                <p className="text-gray-400 text-sm mt-1">Platform-wide feedback on AI assistance effectiveness</p>
              </div>
              
              <div className="p-6">
                {/* Search by email */}
                <form onSubmit={handleEmailSearch} className="mb-6">
                  <div className="flex">
                    <input
                      type="text"
                      placeholder="Search by email..."
                      value={searchEmail}
                      onChange={(e) => setSearchEmail(e.target.value)}
                      className="bg-gray-800 border border-gray-700 rounded-l-md px-4 py-2 text-gray-300 focus:outline-none focus:border-yellow-500 flex-grow"
                    />
                    <button
                      type="submit"
                      className="bg-yellow-500 text-black rounded-r-md px-4 py-2 hover:bg-yellow-400 transition-colors"
                    >
                      <FaSearch />
                    </button>
                  </div>
                </form>
                
                {generalFeedbacksLoading ? (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
                  </div>
                ) : generalFeedbacksError ? (
                  <div className="bg-red-900/30 border border-red-700 rounded-md p-4">
                    <p className="text-red-400">{generalFeedbacksError}</p>
                    <p className="text-sm text-red-300 mt-1">Please try refreshing the page or contact support.</p>
                  </div>
                ) : generalFeedbacks.length === 0 ? (
                  <div className="bg-gray-800/50 rounded-lg p-8 text-center">
                    <p className="text-gray-400">No general feedback data available.</p>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#111111] rounded-lg p-4 border border-gray-700 mb-6">
                      <h4 className="text-sm font-medium text-gray-400 mb-3">Feedback Overview</h4>
                      <div className="flex items-center space-x-4">
                        <p className="text-yellow-400 font-medium">
                          {generalFeedbacks.length} General Feedbacks
                        </p>
                      </div>
                    </div>
                    
                    <h4 className="text-lg font-medium text-gray-300 mb-4">User Feedback Responses</h4>
                    <div className="space-y-4">
                      {generalFeedbacks.map((feedback) => (
                        <GeneralFeedbackItem key={feedback._id} feedback={feedback} />
                      ))}
                    </div>
                    
                    {/* Pagination controls */}
                    {totalPages > 1 && (
                      <div className="flex justify-center mt-6 space-x-2">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-3 py-1 rounded ${
                            currentPage === 1 
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          Previous
                        </button>
                        
                        <div className="flex space-x-1">
                          {[...Array(totalPages).keys()].map((page) => {
                            // Only show 5 page numbers at a time
                            if (
                              page + 1 === 1 ||
                              page + 1 === totalPages ||
                              (page + 1 >= currentPage - 1 && page + 1 <= currentPage + 1)
                            ) {
                              return (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page + 1)}
                                  className={`w-8 h-8 rounded ${
                                    currentPage === page + 1
                                      ? 'bg-yellow-500 text-black font-bold'
                                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                  }`}
                                >
                                  {page + 1}
                                </button>
                              );
                            } else if (
                              (page + 1 === currentPage - 2 && currentPage > 3) ||
                              (page + 1 === currentPage + 2 && currentPage < totalPages - 2)
                            ) {
                              return <span key={page} className="self-center text-gray-500">...</span>;
                            }
                            return null;
                          })}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-3 py-1 rounded ${
                            currentPage === totalPages 
                              ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          Next
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Create a loading fallback component
function FeedbacksLoading() {
  return (
    <div className="min-h-screen w-full bg-black">
      <div className="px-4 sm:px-6 lg:px-8 py-6 w-full max-w-[1600px] mx-auto">
        <h1 className="text-3xl font-bold text-white">Feedback Analysis</h1>
        <p className="text-gray-400 mt-1">Loading feedback data...</p>
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      </div>
    </div>
  );
}

// Main page component with Suspense boundary
export default function FeedbacksPage() {
  return (
    <Suspense fallback={<FeedbacksLoading />}>
      <FeedbacksContent />
    </Suspense>
  );
}