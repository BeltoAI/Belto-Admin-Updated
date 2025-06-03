"use client";
import { Suspense } from 'react';
import React, { useState, useEffect, useCallback } from 'react';
import { 
  TableProperties, ChevronDown, ChevronRight, Link as LinkIcon, 
  Plus, CircleUser, Upload, Check, Clipboard, Settings, Edit, 
  Save, Trash, File, Video, X, Download, Clock, MessageSquare, 
  ThumbsUp, ThumbsDown, Lock 
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

const LectureStudentDataManagement = () => {
  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
        <LectureContent />
      </Suspense>
    </div>
  );
};

// Internal component that uses useSearchParams
function LectureContent() {
  const searchParams = useSearchParams();
  const lectureId = searchParams.get('lectureId');
  const [currentLecture, setCurrentLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  const [students, setStudents] = useState([]);

  // Modified Lecture Data State
  const [lectures, setLectures] = useState([]);

  // Add this state to track if analytics is loading
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Define fetchLectureData using useCallback so it is available to useEffect
  const fetchLectureData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/lectures/${lectureId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch lecture data');
      }
      const data = await response.json();
      setCurrentLecture(data);
      // Update lectures state with the fetched lecture including materials and FAQs
      setLectures([{
        id: data._id,
        title: data.title,
        isOpen: true,
        description: data.description,
        materials: data.materials.map(material => ({
          id: material._id,
          title: material.title,
          fileUrl: material.fileUrl,
          fileType: material.fileType,
          uploadedAt: new Date(material.uploadedAt).toLocaleString()
        })) || [],
        faqs: data.faqs.map(faq => ({
          id: faq._id,
          question: faq.question,
          answer: faq.answer,
          createdAt: new Date(faq.createdAt).toLocaleString()
        })) || [],
        allowCopyPaste: !data.copyPasteRestricted,
        startDate: data.startDate,
        endDate: data.endDate,
        status: data.status
      }]);
    } catch (error) {
      console.error('Error fetching lecture:', error);
    } finally {
      setLoading(false);
    }
  }, [lectureId]);

  // Now use the callback in useEffect
  useEffect(() => {
    if (lectureId) {
      fetchLectureData();
    }
  }, [lectureId, fetchLectureData]);

  const fetchStudents = useCallback(async () => {
    try {
      if (!lectureId) return;
      
      const response = await fetch(`/api/lectures/${lectureId}/students`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch students');
      }
      
      const data = await response.json();
      
      // Initialize students with default analytics values
      setStudents(data.map(student => ({
        ...student,
        selected: false,
        analytics: {
          timeSpent: '0h',
          promptsMade: 0,
          likesGiven: 0,
          dislikesGiven: 0
        }
      })));
    } catch (error) {
      console.error('Error fetching students:', error);
      // Just log to console instead of using toast
      console.error("Failed to load students:", error);
    }
  }, [lectureId]);
  
  // Make sure to add this useEffect if it's not already there
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]);

  // Add a separate function to fetch analytics
  const fetchStudentAnalytics = async (studentId) => {
    try {
      setAnalyticsLoading(true);
      console.log(`Fetching analytics for student ID: ${studentId}`);
      
      const response = await fetch(`/api/analytics/student-data?userId=${studentId}`);
      const rawResponse = await response.text();
      console.log("Raw API response:", rawResponse);
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      // Parse the JSON response
      const data = JSON.parse(rawResponse);
      console.log("Parsed analytics data:", data);
      
      if (!data || !data.analytics) {
        throw new Error("Invalid analytics data format");
      }
      
      return data.analytics;
    } catch (error) {
      console.error('Error fetching student analytics:', error);
      return {
        timeSpent: '0h',
        promptsMade: 0,
        likesGiven: 0,
        dislikesGiven: 0
      };
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleRemoveStudent = (id) => {
    setStudents(students.filter(student => student.id !== id));
  };

  const handleRemoveMaterial = (lectureId, materialId) => {
    setLectures(lectures.map(lecture => 
      lecture.id === lectureId ? {
        ...lecture,
        materials: lecture.materials.filter(m => m.id !== materialId)
      } : lecture
    ));
  };

  const handleRemoveFAQ = (lectureId, faqId) => {
    setLectures(lectures.map(lecture => 
      lecture.id === lectureId ? {
        ...lecture,
        faqs: lecture.faqs.filter(f => f.id !== faqId)
      } : lecture
    ));
  };

  // Copy-Paste Restrictions (SOW 3.1)
  const handleCopyPasteToggle = (lectureId) => {
    setLectures(lectures.map(lecture => 
      lecture.id === lectureId ? {
        ...lecture,
        allowCopyPaste: !lecture.allowCopyPaste
      } : lecture
    ));
  };

  // Selected Student Management
  const [selectedStudent, setSelectedStudent] = useState({
    analytics: {
      timeSpent: 0,
      promptsMade: 0,
      likesGiven: 0,
      dislikesGiven: 0
    }
  });

  // Replace your handleStudentSelect function with this simplified version
const handleStudentSelect = async (student, e) => {
  try {
    // Prevent handling when clicking buttons inside the row
    if (e && e.target.closest('button')) {
      return;
    }
    
    console.log("Student selected:", student);
    
    // Mark this student as selected in the students list
    setStudents(prevStudents => 
      prevStudents.map(s => ({
        ...s,
        selected: s.id === student.id
      }))
    );
    
    // Set initial selected student with loading state
    setSelectedStudent({
      ...student,
      selected: true,
      analytics: {
        timeSpent: 'Loading...',
        promptsMade: '...',
        likesGiven: '...',
        dislikesGiven: '...'
      }
    });
    
    // Direct API call to the URL that works in the browser
    const apiUrl = `/api/analytics/student-data?userId=${student.id}`;
    console.log(`Fetching from: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    const responseText = await response.text();
    console.log("Raw API response:", responseText);
    
    try {
      const data = JSON.parse(responseText);
      console.log("Parsed data:", data);
      
      if (data && data.analytics) {
        // Force a complete replacement of the selectedStudent object
        // to ensure React detects the state change
        const updatedStudent = {
          ...student,
          selected: true,
          analytics: {
            timeSpent: data.analytics.timeSpent,
            promptsMade: data.analytics.promptsMade,
            likesGiven: data.analytics.likesGiven,
            dislikesGiven: data.analytics.dislikesGiven
          }
        };
        
        console.log("Updating with:", updatedStudent);
        setSelectedStudent(updatedStudent);
      }
    } catch (error) {
      console.error("Failed to parse API response:", error);
    }
    
  } catch (error) {
    console.error('Error in handleStudentSelect:', error);
    
    // Fallback to default values on error
    setSelectedStudent({
      ...student,
      selected: true,
      analytics: {
        timeSpent: '0h',
        promptsMade: 0,
        likesGiven: 0,
        dislikesGiven: 0
      }
    });
  }
};

  // Lecture Expansion Toggle
  const handleLectureToggle = (lectureId) => {
    setLectures(lectures.map(lecture => ({
      ...lecture,
      isOpen: lecture.id === lectureId ? !lecture.isOpen : lecture.isOpen
    })));
  };

  // handleAddLecture
  const handleAddLecture = () => {
    const newLecture = {
      id: Date.now(), // Better to use timestamp for unique ID
      title: `New Lecture ${lectures.length + 1}`,
      isOpen: false,
      description: 'Lecture description...',
      materials: [],
      faqs: [],
      allowCopyPaste: false,
      aiSettings: {
        model: 'Zypher 7B',
        temperature: 0.7,
        maxTokens: 1000
      }
    };
    setLectures(prev => [...prev, newLecture]);
  };

  const handleEditLecture = () => {
    if (lectureId) {
      router.push(`/lecture-student-management/edit?lectureId=${lectureId}`);
    }
  };

  // handleAiPreferences
  const handleAiPreferences = () => {
    if (lectureId) {
      router.push(`/ai-preferences?lectureId=${lectureId}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-yellow-400">Loading lecture data...</div>
      </div>
    );
  }

  if (!currentLecture) {
    return (
      <div className="flex items-center justify-center">
        <div className="text-red-400">No lecture found</div>
      </div>
    );
  }

  return (
    <>
      {/* Student Management Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
        {/* Student List - Now 2 columns on medium screens */}
        <div className="lg:col-span-2 bg-neutral-900/50 rounded-xl p-4 md:p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4 md:mb-6">
            <div className="flex items-center gap-2 md:gap-3 text-gray-400">
              <TableProperties className="w-5 h-5 md:w-6 md:h-6" />
              <h2 className="text-lg md:text-xl">Student Roster</h2>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-neutral-800 text-gray-400">
                  <th className="p-2 md:p-3 text-left font-normal text-sm md:text-base">Student Name</th>
                  <th className="p-2 md:p-3 text-left font-normal text-sm md:text-base hidden md:table-cell">Email</th>
                  <th className="p-2 md:p-3 text-left font-normal text-sm md:text-base">Student ID</th>
                  <th className="p-2 md:p-3 text-left font-normal text-sm md:text-base">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => (
                  <tr
                  key={student.id}
                  className={`cursor-pointer ${student.selected ? 'bg-blue-600/20' : 'hover:bg-neutral-800'}`}
                  onClick={(e) => handleStudentSelect(student, e)}
                >
                  <td className="p-2 md:p-3 text-gray-300 text-sm md:text-base">{student.username || "Student Name"}</td>
                  <td className="p-2 md:p-3 text-gray-400 text-sm md:text-base hidden md:table-cell">{student.email}</td>
                  <td className="p-2 md:p-3 text-gray-400 text-sm md:text-base">{student.id}</td>
                  <td className="p-2 md:p-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();  // Prevent row click handler
                        handleRemoveStudent(student.id);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                  </td>
                </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Analytics */}
        <div 
          key={selectedStudent?.id || 'no-student'} 
          className="bg-neutral-900/50 rounded-xl p-4 md:p-6"
        >
          <div className="flex items-center gap-2 md:gap-3 text-gray-400 mb-4 md:mb-6">
            <CircleUser className="w-5 h-5 md:w-6 md:h-6" />
            <h2 className="text-lg md:text-xl">Student Analytics</h2>
          </div>
          {selectedStudent && selectedStudent.analytics ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
              <StatCard 
                icon={<Clock className="w-4 h-4 md:w-5 md:h-5" />} 
                label="Time Spent" 
                value={selectedStudent.analytics.timeSpent} 
              />
              <StatCard 
                icon={<MessageSquare className="w-4 h-4 md:w-5 md:h-5" />} 
                label="Prompts" 
                value={selectedStudent.analytics.promptsMade} 
              />
              <StatCard 
                icon={<ThumbsUp className="w-4 h-4 md:w-5 md:h-5" />} 
                label="Likes" 
                value={selectedStudent.analytics.likesGiven} 
              />
              <StatCard 
                icon={<ThumbsDown className="w-4 h-4 md:w-5 md:h-5" />} 
                label="Dislikes" 
                value={selectedStudent.analytics.dislikesGiven} 
              />
            </div>
          ) : (
            <div className="text-gray-400 text-center py-4">
              No analytics data available
            </div>
          )}
        </div>
      </div>

      {/* Lecture Management Section */}
      <div className="space-y-4 md:space-y-6">
        {lectures.map((lecture) => (
          <div key={lecture.id} className="bg-neutral-900 rounded-xl">
            {/* Lecture Header */}
            <div
              className="p-4 md:p-6 flex justify-between items-center cursor-pointer hover:bg-neutral-800 transition-colors"
              onClick={() => handleLectureToggle(lecture.id)}
            >
              <div className="flex items-center gap-2 md:gap-3">
                <span className="text-gray-300 text-base md:text-lg">{lecture.title}</span>
              </div>
              {lecture.isOpen ? (
                <ChevronDown className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
              ) : (
                <ChevronRight className="text-yellow-400 w-5 h-5 md:w-6 md:h-6" />
              )}
            </div>

            {lecture.isOpen && (
              <div className="p-4 md:p-6 pt-0 space-y-4 md:space-y-6">
      <div className="mb-6">
      <span className={`px-3 py-1 rounded-full text-sm ${
        currentLecture.status === 'cancelled' ? 'bg-red-500/20 text-red-400' : 
        'bg-green-500/20 text-green-400'
      }`}>
        {currentLecture.status.charAt(0).toUpperCase() + currentLecture.status.slice(1)}
      </span>
    </div>
                {/* Lecture Details Section - New */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-yellow-400 flex items-center gap-2 text-sm md:text-base">
                    <File className="w-4 h-4 md:w-5 md:h-5" /> Lecture Details
                  </h3>
                  <div className="bg-neutral-800 p-4 rounded-lg space-y-3">
                    <div>
                      <h4 className="text-yellow-400 text-sm mb-2">Description</h4>
                      <p className="text-gray-300 text-sm md:text-base leading-relaxed">
                        {lecture.description}
                      </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-yellow-400 text-sm mb-2">Start Time</h4>
                        <p className="text-gray-300 text-sm md:text-base">
                          {new Date(lecture.startDate).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <h4 className="text-yellow-400 text-sm mb-2">End Time</h4>
                        <p className="text-gray-300 text-sm md:text-base">
                          {new Date(lecture.endDate).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Materials Section */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-yellow-400 flex items-center gap-2 text-sm md:text-base">
                    <File className="w-4 h-4 md:w-5 md:h-5" /> Lecture Materials
                  </h3>
                  <div className="space-y-2">
                    {lecture.materials.map((material) => (
                      <div key={material.id} className="bg-neutral-800 p-3 md:p-4 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <div className="flex items-center gap-2 md:gap-3">
                          <File className="text-yellow-500 w-4 h-4 md:w-5 md:h-5" />
                          <div className="flex flex-col">
                            <span className="text-gray-300 text-sm md:text-base truncate">{material.title}</span>
                            <span className="text-xs text-gray-400">Uploaded: {material.uploadedAt}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {material.fileUrl && (
                            <a
                              href={material.fileUrl}
                              download={material.title}
                              className="text-yellow-500 hover:text-yellow-400"
                            >
                              <Download className="w-4 h-4 md:w-5 md:h-5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleRemoveMaterial(lecture.id, material.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FAQs Section */}
                <div className="space-y-3 md:space-y-4">
                  <h3 className="text-yellow-400 flex items-center gap-2 text-sm md:text-base">
                    <Clipboard className="w-4 h-4 md:w-5 md:h-5" /> FAQs
                  </h3>
                  <div className="space-y-2">
                    {lecture.faqs.map((faq) => (
                      <div key={faq.id} className="bg-neutral-800 p-3 md:p-4 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex flex-col">
                            <h4 className="text-yellow-500 font-medium text-sm md:text-base">{faq.question}</h4>
                            <span className="text-xs text-gray-400">Added: {faq.createdAt}</span>
                          </div>
                          <button
                            onClick={() => handleRemoveFAQ(lecture.id, faq.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>
                        <p className="text-gray-300 text-sm md:text-base">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Security Settings */}
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <button
                      onClick={() => handleCopyPasteToggle(lecture.id)}
                      className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center ${
                        lecture.allowCopyPaste ? 'bg-yellow-400' : 'bg-neutral-700'
                      }`}
                    >
                      {lecture.allowCopyPaste && (
                        <Check className="text-black w-3 h-3 md:w-4 md:h-4" />
                      )}
                    </button>
                    <span className="text-gray-300 text-sm md:text-base">Allow Copy/Paste</span>
                  </div>
                </div>
                {/* AI Preferences Link */}
                <button
                  onClick={handleAiPreferences}
                  className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm md:text-base"
                >
                  <Settings className="w-4 h-4 md:w-5 md:h-5" /> AI Preferences
                </button>

                {/* Edit Lecture Button */}
                <button
                  onClick={handleEditLecture}
                  className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 text-sm md:text-base ml-4"
                >
                  <Edit className="w-4 h-4 md:w-5 md:h-5" /> Edit Lecture
                </button>
              </div>
              
            )}
          </div>
        ))}

        {/* Add Lecture Button */}
        <button
          onClick={handleAddLecture}
          className="w-full bg-neutral-900 hover:bg-neutral-800 text-yellow-400 p-4 md:p-6 rounded-xl flex items-center justify-center gap-2 transition-colors text-sm md:text-base"
        >
          <Plus className="w-5 h-5 md:w-6 md:h-6" /> New Lecture
        </button>
      </div>
    </>
  );
}

// Reusable Stat Card Component
const StatCard = ({ icon, label, value }) => (
  <div className="bg-neutral-800 p-4 rounded-lg">
    <div className="flex items-center gap-2 mb-2 text-yellow-400">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-xl font-medium text-gray-300">
      {value === '...' ? '...' : 
       value === undefined || value === null ? '0' : 
       value}
    </div>
  </div>
);
export default LectureStudentDataManagement;