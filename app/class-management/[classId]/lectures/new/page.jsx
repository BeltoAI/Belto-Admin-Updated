"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiCalendar, FiClock, FiUpload, FiX, FiCheck } from 'react-icons/fi';
import { CgSpinner } from 'react-icons/cg';
import { useLectures } from '@/hooks/useLectures';
import { toast } from 'react-toastify';
import { extractFileContent } from '@/utils/extractFileContent';

const daysOfWeek = [
  { id: 'monday', label: 'Monday' },
  { id: 'tuesday', label: 'Tuesday' },
  { id: 'wednesday', label: 'Wednesday' },
  { id: 'thursday', label: 'Thursday' },
  { id: 'friday', label: 'Friday' },
  { id: 'saturday', label: 'Saturday' },
  { id: 'sunday', label: 'Sunday' },
];

// Utility function to upload a file (mock implementation)
const uploadFile = async (file) => {
  // In a real implementation, this would upload to a server
  // For now, we'll create a URL for the file
  return { url: URL.createObjectURL(file) };
};

const NewLecturePage = ({ params }) => {
  const router = useRouter();
  const { createLecture } = useLectures(params.classId);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [processingFiles, setProcessingFiles] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseStartDate: '',
    courseEndDate: '',
    lectureTime: {
      start: '',
      end: ''
    },
    selectedDays: [],
  });

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        // Add file to processing state
        setProcessingFiles(prev => [...prev, file.name]);
        
        // Upload file to storage
        const result = await uploadFile(file);
        
        // Extract content from file
        const extractedContent = await extractFileContent(file);
        
        // Log extracted content to console
        console.log(`Extracted content from ${file.name}:`, extractedContent);
        
        // Add file to uploaded files with extracted content
        setUploadedFiles(prev => [...prev, {
          title: file.name,
          fileUrl: result.url,
          fileType: file.type,
          content: extractedContent
        }]);
        
        toast.success(`Uploaded and processed ${file.name}`);
      } catch (error) {
        toast.error(`Failed to process ${file.name}: ${error.message}`);
        console.error(`Error processing ${file.name}:`, error);
      } finally {
        // Remove file from processing state
        setProcessingFiles(prev => prev.filter(name => name !== file.name));
      }
    }
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleDay = (dayId) => {
    setFormData(prev => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayId)
        ? prev.selectedDays.filter(d => d !== dayId)
        : [...prev.selectedDays, dayId]
    }));
  };

  const generateLectureDates = () => {
    const start = new Date(formData.courseStartDate);
    const end = new Date(formData.courseEndDate);
    const lectures = [];
    
    const dayMap = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6
    };

    const [startHour, startMinute] = formData.lectureTime.start.split(':');
    const [endHour, endMinute] = formData.lectureTime.end.split(':');
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      const dayName = Object.keys(dayMap).find(key => dayMap[key] === dayOfWeek);
      
      if (formData.selectedDays.includes(dayName)) {
        const lectureStart = new Date(currentDate);
        lectureStart.setHours(parseInt(startHour), parseInt(startMinute));
        
        const lectureEnd = new Date(currentDate);
        lectureEnd.setHours(parseInt(endHour), parseInt(endMinute));
        
        lectures.push({
          title: formData.title,
          description: formData.description,
          startDate: lectureStart.toISOString(),
          endDate: lectureEnd.toISOString(),
          materials: uploadedFiles
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return lectures;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate form
      if (formData.selectedDays.length === 0) {
        throw new Error('Please select at least one day for lectures');
      }

      if (!formData.courseStartDate || !formData.courseEndDate) {
        throw new Error('Please set both start and end dates');
      }

      if (!formData.lectureTime.start || !formData.lectureTime.end) {
        throw new Error('Please set both start and end times');
      }

      const startTime = new Date(`1970-01-01T${formData.lectureTime.start}`);
      const endTime = new Date(`1970-01-01T${formData.lectureTime.end}`);
      
      if (endTime <= startTime) {
        throw new Error('End time must be after start time');
      }
      
      // Check if any files are still processing
      if (processingFiles.length > 0) {
        throw new Error('Please wait for all files to finish processing');
      }

      // Generate all lecture dates
      const lectures = generateLectureDates();
      
      // Create all lectures
      for (const lecture of lectures) {
        await createLecture(lecture);
      }

      toast.success(`Created ${lectures.length} lectures successfully`);
      router.push('/class-management');
    } catch (error) {
      toast.error(error.message || 'Failed to create lectures');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('lectureTime.')) {
      const timeKey = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        lectureTime: {
          ...prev.lectureTime,
          [timeKey]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-400 hover:text-white mb-4"
          >
            <FiArrowLeft className="mr-2" /> Back to Lectures
          </button>
          <h1 className="text-3xl font-bold">Create Recurring Lectures</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Lecture Title
            </label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter lecture title"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4"
              placeholder="Enter lecture description"
              className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium text-gray-300">Course Duration</h3>
              
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">
                  <FiCalendar className="inline mr-2" />
                  Start Date
                </label>
                <input
                  type="date"
                  name="courseStartDate"
                  required
                  value={formData.courseStartDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-400">
                  <FiCalendar className="inline mr-2" />
                  End Date
                </label>
                <input
                  type="date"
                  name="courseEndDate"
                  required
                  value={formData.courseEndDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-300">Lecture Time</h3>
              
              <div className="space-y-2">
                <label className="block text-sm text-gray-400">
                  <FiClock className="inline mr-2" />
                  Start Time
                </label>
                <input
                  type="time"
                  name="lectureTime.start"
                  required
                  value={formData.lectureTime.start}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm text-gray-400">
                  <FiClock className="inline mr-2" />
                  End Time
                </label>
                <input
                  type="time"
                  name="lectureTime.end"
                  required
                  value={formData.lectureTime.end}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-300">Lecture Days</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {daysOfWeek.map(day => (
                <button
                  key={day.id}
                  type="button"
                  onClick={() => toggleDay(day.id)}
                  className={`flex items-center justify-between px-4 py-3 rounded-lg border ${
                    formData.selectedDays.includes(day.id)
                      ? 'bg-yellow-500 text-black border-yellow-500'
                      : 'bg-gray-800 text-gray-300 border-gray-700'
                  }`}
                >
                  {day.label}
                  {formData.selectedDays.includes(day.id) && (
                    <FiCheck className="ml-2" />
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-medium text-gray-300">Lecture Materials</h3>
            
            <div className="space-y-2">
              <label 
                htmlFor="fileUpload"
                className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-yellow-500 transition-colors"
              >
                <div className="text-center">
                  <FiUpload className="mx-auto h-8 w-8 text-gray-400" />
                  <span className="mt-2 block text-sm font-medium text-gray-400">
                    Click to upload lecture materials
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PDF, DOC, DOCX files will have content extracted
                  </span>
                </div>
                <input
                  id="fileUpload"
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                />
              </label>
            </div>

            {processingFiles.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 mb-4">
                <div className="flex items-center text-yellow-500 mb-2">
                  <CgSpinner className="animate-spin mr-2" />
                  <span>Processing files...</span>
                </div>
                <ul className="text-sm text-gray-400">
                  {processingFiles.map((file, idx) => (
                    <li key={idx} className="flex items-center">
                      <CgSpinner className="animate-spin mr-2 text-yellow-500" /> {file}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                {uploadedFiles.map((file, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                  >
                    <div className="flex flex-col">
                      <span className="text-sm text-gray-300">{file.title}</span>
                      {file.content && (
                        <span className="text-xs text-green-500">Content extracted ({file.content.length} characters)</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <FiX />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || processingFiles.length > 0}
              className={`px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors flex items-center ${
                isSubmitting || processingFiles.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Creating...' : 'Create Lectures'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewLecturePage;