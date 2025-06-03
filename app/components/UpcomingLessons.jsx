"use client";
import React, { useState, useEffect } from 'react';
import {
  MdCalendarToday,
  MdChevronLeft,
  MdChevronRight,
} from 'react-icons/md';
import { useRouter } from 'next/navigation';

const UpcomingLessons = ({ classes, lectures }) => {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeDay, setActiveDay] = useState(new Date().getDate().toString().padStart(2, '0'));
  const [selectedDayLectures, setSelectedDayLectures] = useState([]);

  // Helper function to safely parse date
  const parseLectureDate = (dateField) => {
    try {
      if (typeof dateField === 'string') {
        return new Date(dateField);
      }
      if (dateField && dateField.$date) {
        return new Date(dateField.$date);
      }
      if (dateField && dateField.$date && dateField.$date.$numberLong) {
        return new Date(parseInt(dateField.$date.$numberLong));
      }
      return new Date(dateField);
    } catch (error) {
      console.error('Error parsing date:', error);
      return new Date();
    }
  };

  // Update lectures when active day changes
  useEffect(() => {
    if (!lectures) return;

    const filteredLectures = lectures.filter(lecture => {
      if (!lecture || !lecture.startDate) return false;
      
      const lectureDate = parseLectureDate(lecture.startDate);
      return (
        lectureDate.getDate().toString().padStart(2, '0') === activeDay &&
        lectureDate.getMonth() === currentDate.getMonth() &&
        lectureDate.getFullYear() === currentDate.getFullYear()
      );
    });
    
    setSelectedDayLectures(filteredLectures);
  }, [activeDay, currentDate, lectures]);

  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  
  const generateDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return [
      ...Array(firstDayOfMonth).fill({ date: '', day: '' }),
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const currentDay = String(i + 1).padStart(2, '0');
        const hasLectures = lectures?.some(lecture => {
          if (!lecture || !lecture.startDate) return false;
          const lectureDate = parseLectureDate(lecture.startDate);
          return (
            lectureDate.getDate().toString().padStart(2, '0') === currentDay &&
            lectureDate.getMonth() === month &&
            lectureDate.getFullYear() === year
          );
        });

        return {
          date: currentDay,
          day: dayNames[new Date(year, month, i + 1).getDay()],
          hasLectures
        };
      }),
    ];
  };

  const handleMonthChange = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(
        prev.getFullYear(),
        prev.getMonth() + (direction === 'prev' ? -1 : 1)
      );
      return newDate;
    });
  };

  const formatDate = (dateField) => {
    const date = parseLectureDate(dateField);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (!lectures) {
    return (
      <div className="bg-[#1C1C1C] rounded-xl p-6 h-full">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
        </div>
      </div>
    );
  }

  const handleLectureClick = (lecture) => {
    router.push(`/lecture-student-management?lectureId=${lecture._id.$oid || lecture._id}`);
  };


  return (
    <div className="bg-[#1C1C1C] rounded-xl p-6 h-full">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          <MdCalendarToday className="text-gray-400 text-xl" />
          <h2 className="text-gray-300 font-medium">Upcoming Lessons</h2>
        </div>
      </div>

      <div className="flex items-center justify-between mb-8">
        <button
          className="p-2 hover:bg-gray-800 rounded-lg"
          onClick={() => handleMonthChange('prev')}
        >
          <MdChevronLeft className="text-gray-400 text-xl" />
        </button>
        <span className="text-gray-300 text-sm font-medium">
          {currentDate.toLocaleString('default', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </span>
        <button
          className="p-2 hover:bg-gray-800 rounded-lg"
          onClick={() => handleMonthChange('next')}
        >
          <MdChevronRight className="text-gray-400 text-xl" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-8">
        {generateDays().map((day, index) => (
          <div
            key={index}
            className={`relative flex flex-col items-center justify-center w-10 h-10 rounded-full 
              ${day.date ? 'cursor-pointer' : ''} text-sm
              ${day.date === activeDay 
                ? 'bg-yellow-500 text-black' 
                : 'text-gray-400 hover:bg-gray-800'}`}
            onClick={() => day.date && setActiveDay(day.date)}
          >
            {day.date && (
              <>
                <span className="font-medium">{day.date}</span>
                <span className="text-[10px] mt-[-2px]">{day.day}</span>
                {day.hasLectures && day.date !== activeDay && (
                  <div className="absolute bottom-1 w-1 h-1 bg-yellow-500 rounded-full"></div>
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-4">
        {selectedDayLectures.length > 0 ? (
          selectedDayLectures.map((lecture) => (
            <div 
              key={lecture._id.$oid || lecture._id} 
              className="bg-[#262626] rounded-xl p-4 cursor-pointer hover:bg-gray-800 transition-colors"
              onClick={() => handleLectureClick(lecture)}
            >
              <h3 className="text-yellow-500 text-sm font-medium mb-2">
                {lecture.title}
              </h3>
              <div className="flex items-center gap-4 text-gray-400 text-xs mb-1">
                <span>{formatDate(lecture.startDate)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-xs">
                  For {lecture.className}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  {
                    'scheduled': 'bg-blue-100 text-blue-800',
                    'in-progress': 'bg-yellow-100 text-yellow-800',
                    'completed': 'bg-green-100 text-green-800',
                    'cancelled': 'bg-red-100 text-red-800'
                  }[lecture.status]
                }`}>
                  {lecture.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-400">
            No lectures scheduled for this day
          </div>
        )}
      </div>
    </div>
  );
};

export default UpcomingLessons;