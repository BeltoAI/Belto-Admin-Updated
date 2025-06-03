// app/lectures/[lectureId]/page.js
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MdEdit, 
  MdDelete, 
  MdArrowBack,
  MdCalendarToday,
  MdAccessTime
} from 'react-icons/md';

const LectureDetails = ({ params }) => {
  const router = useRouter();
  const [lecture, setLecture] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    const fetchLectureDetails = async () => {
      try {
        const response = await fetch(`/api/lectures/${params.lectureId}`);
        if (!response.ok) throw new Error('Failed to fetch lecture');
        const data = await response.json();
        setLecture(data);
        setFormData({
          title: data.title,
          description: data.description,
          startDate: new Date(data.startDate).toISOString().slice(0, 16),
          endDate: new Date(data.endDate).toISOString().slice(0, 16),
          status: data.status
        });
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchLectureDetails();
  }, [params.lectureId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      title: lecture.title,
      description: lecture.description,
      startDate: new Date(lecture.startDate).toISOString().slice(0, 16),
      endDate: new Date(lecture.endDate).toISOString().slice(0, 16),
      status: lecture.status
    });
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/lectures/${params.lectureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update lecture');
      
      const updatedLecture = await response.json();
      setLecture(updatedLecture);
      setIsEditing(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this lecture?')) return;

    try {
      const response = await fetch(`/api/lectures/${params.lectureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete lecture');
      
      router.push('/dashboard');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (loading) {
    return (
      <div className="p-4 md:p-8 bg-black min-h-screen">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 md:p-8 bg-black min-h-screen text-white">
        <div className="bg-red-500 p-4 rounded-lg">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-black min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => router.push('/dashboard')}
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-6"
        >
          <MdArrowBack /> Back to Dashboard
        </button>

        <div className="bg-[#1C1C1C] rounded-xl p-6">
          {isEditing ? (
            // Edit Form
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-[#262626] text-white p-2 rounded-lg"
                placeholder="Lecture Title"
              />
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full bg-[#262626] text-white p-2 rounded-lg min-h-[100px]"
                placeholder="Lecture Description"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Start Date</label>
                  <input
                    type="datetime-local"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="w-full bg-[#262626] text-white p-2 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">End Date</label>
                  <input
                    type="datetime-local"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="w-full bg-[#262626] text-white p-2 rounded-lg"
                  />
                </div>
              </div>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-[#262626] text-white p-2 rounded-lg"
              >
                <option value="scheduled">Scheduled</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            // View Mode
            <div>
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-semibold text-white">{lecture.title}</h1>
                <div className="flex gap-2">
                  <button
                    onClick={handleEdit}
                    className="p-2 hover:bg-gray-800 rounded-lg text-yellow-500"
                  >
                    <MdEdit size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 hover:bg-gray-800 rounded-lg text-red-500"
                  >
                    <MdDelete size={20} />
                  </button>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-medium text-gray-300 mb-2">Description</h2>
                  <p className="text-gray-400">{lecture.description}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MdCalendarToday />
                    <span>
                      {new Date(lecture.startDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <MdAccessTime />
                    <span>
                      {new Date(lecture.startDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                      {' - '}
                      {new Date(lecture.endDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LectureDetails;