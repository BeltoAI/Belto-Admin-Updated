"use client";
import { Suspense } from 'react';
import React, { useState, useEffect } from 'react';
import { 
  TableProperties, ChevronDown, ChevronRight, File, 
  Plus, CircleUser, Clock, MessageSquare, 
  ThumbsUp, ThumbsDown, Trash, Edit, AlertCircle
} from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

const LectureStudentDataManagement = () => {
  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
        <LectureContent />
      </Suspense>
    </div>
  );
};

function LectureContent() {
  const params = useParams();
  const classId = params.classId;
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [classData, setClassData] = useState(null);
  const [students, setStudents] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [deleteLectureLoading, setDeleteLectureLoading] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    async function fetchClassData() {
      try {
        setLoading(true);
        setError(null);

        const [classResponse, studentsResponse, lecturesResponse] = await Promise.all([
          fetch(`/api/classes/${classId}`),
          fetch(`/api/classes/${classId}/students`),
          fetch(`/api/classes/${classId}/lectures`)
        ]);

        if (!classResponse.ok || !studentsResponse.ok || !lecturesResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const [classData, studentsData, lecturesData] = await Promise.all([
          classResponse.json(),
          studentsResponse.json(),
          lecturesResponse.json()
        ]);

        setClassData(classData);
        
        const formattedStudents = studentsData.map(student => ({
          id: student._id,
          username: student.username,
          email: student.email,
          selected: false,
          analytics: {
            timeSpent: '0h',
            promptsMade: 0,
            likesGiven: 0,
            dislikesGiven: 0
          }
        }));
        
        setStudents(formattedStudents);
        
        const formattedLectures = lecturesData.map(lecture => ({
          id: lecture._id,
          title: lecture.title,
          isOpen: false,
          description: lecture.description,
          startDate: lecture.startDate,
          endDate: lecture.endDate,
          status: lecture.status
        }));
        
        setLectures(formattedLectures);
        setLoading(false);
        
        // After initial data is loaded and displayed, set the first student as selected
        // and fetch their analytics
        if (formattedStudents.length > 0) {
          const firstStudent = formattedStudents[0];
          setSelectedStudent({...firstStudent, selected: true});
          
          // Update students array to mark first student as selected
          setStudents(formattedStudents.map((s, index) => ({
            ...s,
            selected: index === 0
          })));
          
          // Fetch analytics after UI has been updated
          fetchStudentAnalytics(firstStudent.id);
        }
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
        setLoading(false);
      }
    }
    
    fetchClassData();
  }, [classId]);

  const fetchStudentAnalytics = async (studentId) => {
    try {
      setAnalyticsLoading(true);
      
      const response = await fetch(`/api/analytics/student-data?userId=${studentId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch student analytics');
      }
      
      const data = await response.json();
      
      // Update the selected student with analytics data
      setSelectedStudent(prev => 
        prev && prev.id === studentId 
          ? { ...prev, analytics: data.analytics } 
          : prev
      );
      
      // Also update in the students array without affecting other properties
      setStudents(prev => prev.map(student => 
        student.id === studentId 
          ? { ...student, analytics: data.analytics }
          : student
      ));
    } catch (err) {
      console.error('Error fetching student analytics:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleDeleteLecture = async (lectureId, e) => {
    try {
      // Prevent event from bubbling up to parent elements
      e.stopPropagation();
      
      // Show confirmation dialog
      if (!confirm("Are you sure you want to delete this lecture? This action cannot be undone.")) {
        return;
      }
      
      setDeleteLectureLoading(true);
      
      // Call the API to delete the lecture
      const response = await fetch(`/api/classes/${classId}/lectures/${lectureId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to delete lecture: ${errorData.message || response.statusText}`);
      }
      
      // On success, update the lectures list
      setLectures(prevLectures => prevLectures.filter(lecture => lecture.id !== lectureId));
      
      // Show success message
      alert("Lecture deleted successfully");
      
    } catch (err) {
      console.error("Error deleting lecture:", err);
      alert(err.message);
    } finally {
      setDeleteLectureLoading(false);
    }
  };

  const handleRemoveStudent = async (studentId) => {
    try {
      // Show confirmation dialog
      if (!confirm("Are you sure you want to remove this student from the class?")) {
        return;
      }
      
      setRemoveLoading(true);
      
      // Use the new API endpoint for removing students
      const response = await fetch(`/api/classes/${classId}/remove-student`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ studentId })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Failed to remove student: ${errorData.message || response.statusText}`);
      }
      
      // On success, update local state
      const updatedStudents = students.filter(student => student.id !== studentId);
      setStudents(updatedStudents);
      
      // If the removed student was selected, select another student
      if (selectedStudent?.id === studentId) {
        if (updatedStudents.length > 0) {
          const firstStudent = updatedStudents[0];
          setSelectedStudent({...firstStudent, selected: true});
          
          // Update selection status in students array
          setStudents(updatedStudents.map((s, index) => ({
            ...s,
            selected: index === 0
          })));
          
          // Fetch analytics for the newly selected student
          fetchStudentAnalytics(firstStudent.id);
        } else {
          setSelectedStudent(null);
        }
      }
      
      // Show success message
      alert("Student removed successfully");
      
    } catch (err) {
      console.error("Error removing student:", err);
      alert(err.message);
    } finally {
      setRemoveLoading(false);
    }
  };

  const handleStudentSelect = (student) => {
    // Update selected student
    setSelectedStudent({...student, selected: true});
    
    // Update selection status in students array
    setStudents(prev => prev.map(s => ({
      ...s,
      selected: s.id === student.id
    })));
    
    // Fetch analytics for the selected student
    fetchStudentAnalytics(student.id);
  };

  const handleLectureToggle = (lectureId) => {
    setLectures(lectures.map(lecture => ({
      ...lecture,
      isOpen: lecture.id === lectureId ? !lecture.isOpen : lecture.isOpen
    })));
  };

  const handleAddLecture = () => {
    router.push(`/class-management/${classId}/lectures/new`);
  };

  const handleEditLecture = (lectureId) => {
    router.push(`/lecture-student-management/edit?lectureId=${lectureId}`);
  };

  if (loading) return <div className="text-yellow-400 text-center">Loading...</div>;
  if (error) return <div className="text-red-400 text-center">{error}</div>;

  return (
    <>
      {/* Class Header */}
      <div className="mb-6">
        <h1 className="text-2xl text-white mb-2">{classData?.name}</h1>
        <p className="text-gray-400">{classData?.description}</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student List */}
          <div className="bg-neutral-900/50 rounded-xl p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-gray-400">
                <TableProperties className="w-5 h-5" />
                <h2 className="text-lg">Students</h2>
              </div>
            </div>

            {/* Student Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-800 text-gray-400">
                    <th className="p-3 text-left">Student Name</th>
                    <th className="p-3 text-left">Email</th>
                    <th className="p-3 text-left">Student ID</th>
                    <th className="p-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-gray-400">
                        No students found
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr
                        key={student.id}
                        className={`cursor-pointer ${student.selected ? 'bg-blue-600/20' : 'hover:bg-neutral-800'}`}
                        onClick={() => handleStudentSelect(student)}
                      >
                        <td className="p-3 text-gray-300">{student.username}</td>
                        <td className="p-3 text-gray-400">{student.email}</td>
                        <td className="p-3 text-gray-400">{student.id}</td>
                        <td className="p-3">
                          <button
                            disabled={removeLoading}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveStudent(student.id);
                            }}
                            className="text-red-400 hover:text-red-300 disabled:opacity-50"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Lectures Section */}
          <div className="space-y-4">
            {lectures.length === 0 ? (
              <div className="bg-neutral-900 rounded-xl p-6 text-center">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-gray-400">No lectures found for this class.</p>
              </div>
            ) : (
              lectures.map((lecture) => (
                <div key={lecture.id} className="bg-neutral-900 rounded-xl">
                  <div
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-neutral-800"
                    onClick={() => handleLectureToggle(lecture.id)}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300">{lecture.title}</span>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        lecture.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {lecture.status}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {/* Delete Lecture Button */}
                      <button
                        onClick={(e) => handleDeleteLecture(lecture.id, e)}
                        disabled={deleteLectureLoading}
                        className="text-red-400 hover:text-red-300 mr-4 disabled:opacity-50"
                        title="Delete lecture"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                      
                      {/* Toggle Indicator */}
                      {lecture.isOpen ? (
                        <ChevronDown className="text-yellow-400 w-5 h-5" />
                      ) : (
                        <ChevronRight className="text-yellow-400 w-5 h-5" />
                      )}
                    </div>
                  </div>

                  {lecture.isOpen && (
                    <div className="p-4 border-t border-neutral-800">
                      <div className="mb-4">
                        <h3 className="text-yellow-400 mb-2">Description</h3>
                        <p className="text-gray-300">{lecture.description || "No description provided"}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-yellow-400 text-sm mb-1">Start Date</h4>
                          <p className="text-gray-300">
                            {lecture.startDate ? new Date(lecture.startDate).toLocaleString() : "Not set"}
                          </p>
                        </div>
                        <div>
                          <h4 className="text-yellow-400 text-sm mb-1">End Date</h4>
                          <p className="text-gray-300">
                            {lecture.endDate ? new Date(lecture.endDate).toLocaleString() : "Not set"}
                          </p>
                        </div>
                      </div>                      <div className="flex gap-4">
                        <button
                          onClick={() => router.push(`/ai-preferences?lectureId=${lecture.id}`)}
                          className="text-yellow-400 hover:text-yellow-300 flex items-center gap-2"
                        >
                          <File className="w-4 h-4" />
                          Ai Preferences
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}

            <button
              onClick={handleAddLecture}
              className="w-full bg-neutral-900 hover:bg-neutral-800 text-yellow-400 p-4 rounded-xl flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" /> Add New Lectures
            </button>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="bg-neutral-900/50 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-400 mb-4">
            <CircleUser className="w-5 h-5" />
            <h2 className="text-lg">Student Analytics</h2>
          </div>
          
          {!selectedStudent ? (
            <div className="text-gray-400 text-center py-4">No student selected</div>
          ) : (
            <>
              <div className="mb-3 border-b border-neutral-800 pb-2">
                <h3 className="text-gray-300">{selectedStudent.username}</h3>
                <p className="text-gray-400 text-sm">{selectedStudent.email}</p>
              </div>
              
              {analyticsLoading ? (
                <div className="text-yellow-400 text-center py-4">Loading analytics...</div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <StatCard 
                    icon={<Clock className="w-4 h-4" />} 
                    label="Time Spent" 
                    value={selectedStudent.analytics.timeSpent} 
                  />
                  <StatCard 
                    icon={<MessageSquare className="w-4 h-4" />} 
                    label="Prompts" 
                    value={selectedStudent.analytics.promptsMade} 
                  />
                  <StatCard 
                    icon={<ThumbsUp className="w-4 h-4" />} 
                    label="Likes" 
                    value={selectedStudent.analytics.likesGiven} 
                  />
                  <StatCard 
                    icon={<ThumbsDown className="w-4 h-4" />} 
                    label="Dislikes" 
                    value={selectedStudent.analytics.dislikesGiven} 
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

const StatCard = ({ icon, label, value }) => (
  <div className="bg-neutral-800 p-3 rounded-lg">
    <div className="flex items-center gap-2 mb-2 text-yellow-400">
      {icon}
      <span className="text-sm">{label}</span>
    </div>
    <div className="text-xl font-medium text-gray-300">{value}</div>
  </div>
);

export default LectureStudentDataManagement;