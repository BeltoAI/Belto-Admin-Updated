"use client";
import React, { useState, useEffect } from 'react';
import {
  MdAttachFile,
  MdInsertDriveFile,
  MdDelete,
  MdDownload,
} from 'react-icons/md';

const UploadedFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/files');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFiles(data);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileName) => {
    if (confirm(`Are you sure you want to delete ${fileName}?`)) {
      try {
        const response = await fetch(`/api/files?filename=${fileName}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        await fetchFiles(); // Refresh the file list after deletion
      } catch (err) {
        console.error('Error deleting file:', err);
        alert('Error deleting file: ' + err.message);
      }
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleString('en-US', {
      year: '2-digit',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 h-full">
        <div className="text-gray-300">Loading files...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 h-full">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1C] rounded-lg p-4 md:p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 md:mb-6">
        <MdAttachFile className="text-gray-400 text-lg md:text-xl" />
        <h2 className="text-gray-300 text-base md:text-lg">Uploaded Files</h2>
      </div>

      {/* File List */}
      <div className="space-y-2 md:space-y-4">
        {files.length === 0 ? (
          <div className="text-gray-400 text-center py-4">
            No files found in uploads folder
          </div>
        ) : (
          files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center justify-between p-2 md:p-3 text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            >
              {/* File Info */}
              <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                <MdInsertDriveFile className="text-gray-400 flex-shrink-0 text-base md:text-lg" />
                <div className="overflow-hidden min-w-0">
                  <div className="text-sm md:text-base truncate">{file.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5 md:mt-1">
                    {formatDate(file.timestamp)} • {formatFileSize(file.size)}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-1 md:gap-2 ml-2 md:ml-4">
                <button
                  onClick={() => window.open(`/uploads/${file.name}`, '_blank')}
                  className="p-1 md:p-1.5 hover:bg-gray-700 rounded-md text-gray-300 hover:text-white transition-colors"
                  aria-label="Download file"
                >
                  <MdDownload className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => handleDelete(file.name)}
                  className="p-1 md:p-1.5 hover:bg-gray-700 rounded-md text-red-400 hover:text-red-300 transition-colors"
                  aria-label="Delete file"
                >
                  <MdDelete className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UploadedFiles;