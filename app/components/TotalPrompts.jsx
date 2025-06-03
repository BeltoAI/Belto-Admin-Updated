"use client";
import React, { useState, useEffect } from 'react';
import { MdMessage, MdThumbUp, MdThumbDown, MdWarning, MdRefresh } from 'react-icons/md';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import apiClient from '@/lib/api-client';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const StatCard = ({ icon: Icon, title, value, valueColor, isLoading, error, onRefresh }) => {
  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 flex flex-col mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className={`text-xl ${valueColor || 'text-gray-400'}`} />
          <h2 className="text-gray-400 text-sm font-medium">{title}</h2>
        </div>
        {onRefresh && (
          <button 
            onClick={onRefresh} 
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-700"
            title="Refresh data"
          >
            <MdRefresh className="text-lg" />
          </button>
        )}
      </div>
      <hr className="border-gray-700 my-4" />
      <div className="mt-2 flex justify-start">
        {isLoading ? (
          <div className="animate-pulse bg-gray-700 h-8 w-20 rounded"></div>
        ) : error ? (
          <div className="flex items-center text-red-500">
            <MdWarning className="mr-2" />
            <span className="text-sm">Error loading data</span>
          </div>
        ) : (
          <span className={`${valueColor} text-3xl font-bold`}>
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
        )}
      </div>
    </div>
  );
};

const StatsCards = ({ user }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchAnalyticsData = async () => {
    // Debug the user object
    console.log("Current user object:", user);
    
    // Check for userId in various possible locations
    const userId = user?.userId || user?._id || user?.id;
    
    if (!userId) {
      console.error("User object doesn't have a valid ID:", user);
      setError("User ID not found");
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log(`Fetching analytics for user ID: ${userId}`);
      const response = await apiClient.get(`/api/analytics/prompt-count?userId=${userId}`);
      
      if (response.data && response.data.success) {
        console.log("Analytics data received:", response.data.data);
        setAnalyticsData(response.data.data);
      } else {
        console.error("API returned unsuccessful response:", response.data);
        throw new Error('Failed to fetch analytics data: ' + (response.data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError(err.message || 'An error occurred while fetching data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      console.log("User object detected, attempting to fetch analytics");
      fetchAnalyticsData();
    } else {
      console.log("No user object available");
      setIsLoading(false);
      setError("User information not available");
    }
  }, [user]);
  
  // Mock data for likes/dislikes chart (if needed)
  const feedbackData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
    datasets: [
      {
        label: 'Likes',
        data: [45, 62, 78, 55],
        borderColor: '#10B981',
        backgroundColor: '#059669',
        tension: 0.4,
      },
      {
        label: 'Dislikes',
        data: [3, 5, 2, 4],
        borderColor: '#EF4444',
        backgroundColor: '#DC2626',
        tension: 0.4,
      },
    ],
  };

  return (
    <div className="space-y-6">
      <StatCard 
        icon={MdMessage}
        title="Total User Prompts"
        value={analyticsData?.grandTotal || 0}
        valueColor="text-yellow-500"
        isLoading={isLoading}
        error={error}
        onRefresh={() => fetchAnalyticsData()}
      />
      
      <StatCard 
        icon={MdThumbUp}
        title="Total Likes"
        value={analyticsData?.reactions?.likes || 0}
        valueColor="text-green-500"
        isLoading={isLoading}
        error={error}
        onRefresh={() => fetchAnalyticsData()}
      />
      <StatCard 
        icon={MdThumbDown}
        title="Total Dislikes"
        value={analyticsData?.reactions?.dislikes || 0}
        valueColor="text-red-500"
        isLoading={isLoading}
        error={error}
        onRefresh={() => fetchAnalyticsData()}
      />
    </div>
  );
};

export default StatsCards;