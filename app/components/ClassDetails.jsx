// components/ClassDetails.jsx
"use client";
import { useState } from 'react';
import {
  FiCopy,
  FiTrash2,
  FiArchive,
  FiEdit,
  FiPlus,
  FiKey,
  FiLink,
  FiInfo,
  FiUsers,
  FiLoader
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const ClassDetails = ({ classItem, onArchive, onDelete }) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(classItem.status);


  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleArchive = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/classes/${classItem._id}/archive`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to archive/unarchive class');
      }

      const updatedClass = await response.json();
      setCurrentStatus(updatedClass.status);
      onArchive(updatedClass);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this class?')) {
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/classes/${classItem._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete class');
      }

      onDelete(classItem._id);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 border-t border-gray-800">
      <div className="mb-4">
        <h2 className="text-xl font-bold">{classItem.name}</h2>
        <p className="text-gray-400 mt-2">{classItem.description}</p>
        <p className="text-gray-400 mt-1">
          Class Time Frame: {classItem.startDate} - {classItem.endDate}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm md:text-base">
        {/* Enrollment Code */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400">
              <FiKey />
              <span>Enrollment Code:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">{classItem.enrollmentCode}</span>
              <FiCopy
                className="text-gray-400 hover:text-yellow-500 cursor-pointer"
                onClick={() => copyToClipboard(classItem.enrollmentCode)}
              />
            </div>
          </div>

          {/* Enrollment URL */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400">
              <FiLink />
              <span>Enrollment URL:</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-500 truncate">{classItem.enrollmentUrl}</span>
              <FiCopy
                className="text-gray-400 hover:text-yellow-500 cursor-pointer"
                onClick={() => copyToClipboard(classItem.enrollmentUrl)}
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400">
              <FiInfo />
              <span>Status:</span>
            </div>
            <span className={`px-2 py-1 rounded ${classItem.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-400'}`}>
              {classItem.status}
            </span>
          </div>

          {/* Students Enrolled */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1 text-gray-400">
              <FiUsers />
              <span>Students Enrolled:</span>
            </div>
            <span className="text-yellow-500">{classItem.students.length}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-end space-y-2">
          <button
            onClick={() => router.push(`/lecture-student-management/${classItem._id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
          >
            <FiPlus /> Lecture & Student Management
          </button>
          <button
            onClick={() => router.push(`/class-management/${classItem._id}/stats`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
          >
            <FiPlus /> View Stats
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mt-4 p-2 bg-red-500/20 text-red-500 rounded">
          {error}
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="mt-6 flex justify-between">
        <button
          onClick={() => router.push(`/class-management/${classItem._id}/lectures/new`)}
          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black rounded-md transition-colors"
          disabled={isLoading}
        >
          <FiPlus /> Add Lecture
        </button>
        <div className="flex gap-4">
          <button
            onClick={() => router.push(`/class-management/edit/${classItem._id}`)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-md text-gray-200 transition-colors"
            disabled={isLoading}
          >
            <FiEdit /> Edit Class
          </button>
          <button
            onClick={handleArchive}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-gray-200 transition-colors ${currentStatus === 'active'
                ? 'bg-gray-700 hover:bg-gray-600'
                : 'bg-green-600 hover:bg-green-500'
              }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <FiLoader className="animate-spin" />
            ) : (
              <FiArchive className={currentStatus === 'active' ? 'text-gray-200' : 'text-white'} />
            )}
            {currentStatus === 'active' ? 'Archive Class' : 'Activate Class'}
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-md text-red-500 transition-colors"
            disabled={isLoading}
          >
            {isLoading ? <FiLoader className="animate-spin" /> : <FiTrash2 />}
            Delete Class
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;