"use client";

import React, { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { MdAccessTime } from 'react-icons/md';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const TimeUsageChart = ({ classes = [], lectures = [] }) => {
  const [selectedRange, setSelectedRange] = useState('30 days');
  const [selectedClass, setSelectedClass] = useState('all');
  const [chartData, setChartData] = useState(null);
  
  // Ensure classes and lectures are arrays
  const classesArray = Array.isArray(classes) ? classes : [];
  const lecturesArray = Array.isArray(lectures) ? lectures : [];
  
  useEffect(() => {
    if (!classesArray.length || !lecturesArray.length) return;
    
    // Prepare data based on selected time range
    const data = prepareChartData(classesArray, lecturesArray, selectedRange, selectedClass);
    setChartData(data);
    
  }, [classesArray, lecturesArray, selectedRange, selectedClass]);

  // Function to prepare chart data based on time range
  const prepareChartData = (classes, lectures, range, classId) => {
    const now = new Date();
    let startDate = new Date();
    let format = 'day'; // default format
    
    // Set date range and format based on selection
    switch(range) {
      case '7 days':
        startDate.setDate(now.getDate() - 7);
        format = 'day';
        break;
      case '30 days':
        startDate.setDate(now.getDate() - 30);
        format = 'week';
        break;
      case '12 months':
        startDate.setMonth(now.getMonth() - 12);
        format = 'month';
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }
    
    // Filter lectures by class if needed
    let filteredLectures = lectures;
    if (classId !== 'all') {
      filteredLectures = lectures.filter(lecture => lecture.classId === classId);
    }
    
    // Filter lectures within the selected date range
    filteredLectures = filteredLectures.filter(lecture => {
      try {
        const lectureStartDate = new Date(lecture.startDate);
        return lectureStartDate >= startDate && lectureStartDate <= now;
      } catch (err) {
        console.error("Error processing lecture date:", err);
        return false;
      }
    });
    
    // Generate data based on selected format
    if (format === 'day') {
      return generateDailyData(filteredLectures, classes, startDate, now);
    } else if (format === 'week') {
      return generateWeeklyData(filteredLectures, classes, startDate, now);
    } else {
      return generateMonthlyData(filteredLectures, classes, startDate, now);
    }
  };
  
  // Calculate lecture duration in hours
  const calculateLectureDuration = (lecture) => {
    try {
      const startTime = new Date(lecture.startDate).getTime();
      const endTime = new Date(lecture.endDate).getTime();
      const durationMs = endTime - startTime;
      return durationMs / (1000 * 60 * 60); // Convert ms to hours
    } catch (err) {
      console.error("Error calculating lecture duration:", err);
      return 0;
    }
  };
  
  // Generate data aggregated by day
  const generateDailyData = (lectures, classes, startDate, endDate) => {
    const days = [];
    const currDate = new Date(startDate);
    
    // Generate day labels
    while (currDate <= endDate) {
      const dateStr = currDate.toLocaleDateString('en-US', {month: 'short', day: 'numeric'});
      days.push(dateStr);
      currDate.setDate(currDate.getDate() + 1);
    }
    
    // Calculate metrics for each day
    const activityData = days.map((day, i) => {
      const dayDate = new Date(startDate);
      dayDate.setDate(startDate.getDate() + i);
      const nextDay = new Date(dayDate);
      nextDay.setDate(dayDate.getDate() + 1);
      
      // Find lectures on this day
      const dayLectures = lectures.filter(lecture => {
        const lectureDate = new Date(lecture.startDate);
        return lectureDate >= dayDate && lectureDate < nextDay;
      });
      
      // Calculate lecture hours
      const lectureHours = dayLectures.reduce((total, lecture) => 
        total + calculateLectureDuration(lecture), 0);
      
      // Count number of materials
      const materialsCount = dayLectures.reduce((total, lecture) => 
        total + (lecture.materials?.length || 0), 0);
      
      // Count attendance
      const attendanceCount = dayLectures.reduce((total, lecture) => 
        total + (lecture.attendance?.length || 0), 0);
      
      return {
        lectureHours: parseFloat(lectureHours.toFixed(1)),
        materialsCount,
        attendanceCount,
        lectureCount: dayLectures.length
      };
    });
    
    return {
      labels: days,
      datasets: [
        {
          label: 'Hours of Instruction',
          data: activityData.map(d => d.lectureHours),
          backgroundColor: '#3B82F6', // Blue
        },
        {
          label: 'Lecture Count',
          data: activityData.map(d => d.lectureCount),
          backgroundColor: '#EAB308', // Yellow
        },
        {
          label: 'Course Materials',
          data: activityData.map(d => d.materialsCount),
          backgroundColor: '#10B981', // Green
        }
      ]
    };
  };
  
  // Generate data aggregated by week
  const generateWeeklyData = (lectures, classes, startDate, endDate) => {
    const weeks = [];
    const weekData = [];
    let currDate = new Date(startDate);
    
    // Generate week labels and group data
    while (currDate <= endDate) {
      const weekStart = new Date(currDate);
      const weekEnd = new Date(currDate);
      weekEnd.setDate(weekStart.getDate() + 6);
      if (weekEnd > endDate) weekEnd.setTime(endDate.getTime());
      
      const weekLabel = `${weekStart.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})} - ${
        weekEnd.toLocaleDateString('en-US', {month: 'short', day: 'numeric'})
      }`;
      
      weeks.push(weekLabel);
      
      // Find lectures in this week
      const weekLectures = lectures.filter(lecture => {
        const lectureDate = new Date(lecture.startDate);
        return lectureDate >= weekStart && lectureDate <= weekEnd;
      });
      
      // Calculate lecture hours
      const lectureHours = weekLectures.reduce((total, lecture) => 
        total + calculateLectureDuration(lecture), 0);
      
      // Count number of materials
      const materialsCount = weekLectures.reduce((total, lecture) => 
        total + (lecture.materials?.length || 0), 0);
      
      // Count attendance
      const attendanceCount = weekLectures.reduce((total, lecture) => 
        total + (lecture.attendance?.length || 0), 0);
      
      weekData.push({
        lectureHours: parseFloat(lectureHours.toFixed(1)),
        materialsCount,
        attendanceCount,
        lectureCount: weekLectures.length
      });
      
      // Move to next week
      currDate.setDate(currDate.getDate() + 7);
    }
    
    return {
      labels: weeks,
      datasets: [
        {
          label: 'Hours of Instruction',
          data: weekData.map(d => d.lectureHours),
          backgroundColor: '#3B82F6', // Blue
        },
        {
          label: 'Lecture Count',
          data: weekData.map(d => d.lectureCount),
          backgroundColor: '#EAB308', // Yellow
        },
        {
          label: 'Course Materials',
          data: weekData.map(d => d.materialsCount),
          backgroundColor: '#10B981', // Green
        }
      ]
    };
  };
  
  // Generate data aggregated by month
  const generateMonthlyData = (lectures, classes, startDate, endDate) => {
    const months = [];
    const monthData = [];
    
    // Get all months in range
    let currDate = new Date(startDate);
    currDate.setDate(1); // Start at first day of month
    
    while (currDate <= endDate) {
      const monthLabel = currDate.toLocaleDateString('en-US', {month: 'short', year: 'numeric'});
      months.push(monthLabel);
      
      const monthStart = new Date(currDate);
      const monthEnd = new Date(currDate);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      monthEnd.setDate(0); // Last day of month
      
      // Find lectures in this month
      const monthLectures = lectures.filter(lecture => {
        const lectureDate = new Date(lecture.startDate);
        return lectureDate >= monthStart && lectureDate <= monthEnd;
      });
      
      // Calculate lecture hours
      const lectureHours = monthLectures.reduce((total, lecture) => 
        total + calculateLectureDuration(lecture), 0);
      
      // Count number of materials
      const materialsCount = monthLectures.reduce((total, lecture) => 
        total + (lecture.materials?.length || 0), 0);
      
      // Count attendance
      const attendanceCount = monthLectures.reduce((total, lecture) => 
        total + (lecture.attendance?.length || 0), 0);
      
      monthData.push({
        lectureHours: parseFloat(lectureHours.toFixed(1)),
        materialsCount,
        attendanceCount,
        lectureCount: monthLectures.length
      });
      
      // Move to next month
      currDate.setMonth(currDate.getMonth() + 1);
    }
    
    return {
      labels: months,
      datasets: [
        {
          label: 'Hours of Instruction',
          data: monthData.map(d => d.lectureHours),
          backgroundColor: '#3B82F6', // Blue
        },
        {
          label: 'Lecture Count',
          data: monthData.map(d => d.lectureCount),
          backgroundColor: '#EAB308', // Yellow
        },
        {
          label: 'Course Materials',
          data: monthData.map(d => d.materialsCount),
          backgroundColor: '#10B981', // Green
        }
      ]
    };
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        position: 'top',
        labels: {
          color: '#9CA3AF'
        }
      },
      tooltip: {
        backgroundColor: '#1F2937',
        titleColor: '#EAB308',
        bodyColor: '#F3F4F6',
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              if (label.includes('Hours')) {
                label += context.parsed.y.toFixed(1) + ' hrs';
              } else {
                label += context.parsed.y;
              }
            }
            return label;
          }
        }
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { 
          color: '#9CA3AF',
          maxRotation: 45,
          minRotation: 45
        },
      },
      y: {
        stacked: true,
        grid: { color: '#374151' },
        ticks: { color: '#9CA3AF' },
        beginAtZero: true,
      },
    },
  };

  return (
    <div className="bg-[#1C1C1C] rounded-lg p-6 h-full">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-2">
          <MdAccessTime className="text-yellow-500 text-xl" />
          <h2 className="text-gray-300 text-lg">Course Activity Analytics</h2>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-gray-800 text-gray-300 px-3 py-1 rounded-md text-sm border border-gray-700"
          >
            <option value="all">All Classes</option>
            {classesArray.map(classItem => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.name}
              </option>
            ))}
          </select>
          
          {['7 days', '30 days', '12 months'].map((range) => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded-md text-sm transition-colors ${
                selectedRange === range 
                  ? 'bg-yellow-500 text-black font-medium' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-72">
        {chartData && chartData.labels && chartData.labels.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center flex-col">
            <p className="text-gray-400 text-center">No lecture data available for the selected period</p>
            <p className="text-gray-500 text-sm mt-2">Try selecting a different time range or class</p>
          </div>
        )}
      </div>
      
      <div className="flex flex-wrap gap-4 mt-4 justify-center">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#3B82F6]"></span>
          <span className="text-gray-300 text-sm">Hours of Instruction</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#EAB308]"></span>
          <span className="text-gray-300 text-sm">Lecture Count</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#10B981]"></span>
          <span className="text-gray-300 text-sm">Course Materials</span>
        </div>
      </div>
    </div>
  );
};

export default TimeUsageChart;