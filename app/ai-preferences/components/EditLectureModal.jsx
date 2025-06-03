"use client";

import { useState, useEffect } from 'react';
import { X, Upload, File, Trash, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

const EditLectureModal = ({ isOpen, onClose, lectureId, onLectureUpdated }) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "scheduled",
    materials: [],
    faqs: [],
    copyPasteRestricted: false
  });

  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch lecture data when modal opens
  useEffect(() => {
    if (isOpen && lectureId) {
      fetchLecture();
    }
  }, [isOpen, lectureId]);

  const fetchLecture = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/lectures/${lectureId}`);
      const data = await res.json();
      
      setFormData({
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate).toISOString().slice(0, 16),
        endDate: new Date(data.endDate).toISOString().slice(0, 16),
        status: data.status,
        materials: data.materials || [],
        faqs: data.faqs || [],
        copyPasteRestricted: data.copyPasteRestricted || false
      });
    } catch (error) {
      console.error('Error fetching lecture:', error);
      toast.error('Failed to load lecture data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAddFaq = () => {
    if (!newFaq.question.trim() || !newFaq.answer.trim()) {
      toast.error('Please enter both question and answer');
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      faqs: [...prev.faqs, { ...newFaq, createdAt: new Date() }]
    }));
    setNewFaq({ question: '', answer: '' });
  };

  const handleRemoveFaq = (index) => {
    setFormData(prev => ({
      ...prev,
      faqs: prev.faqs.filter((_, i) => i !== index)
    }));
  };  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    for (const file of files) {
      try {
        console.log(`📤 Starting upload for: ${file.name}`);
        console.log(`   - Size: ${file.size} bytes`);
        console.log(`   - Type: ${file.type}`);
        
        // Create FormData for file upload
        const uploadFormData = new FormData();
        uploadFormData.append('file', file);
        uploadFormData.append('lectureId', lectureId);

        console.log('🚀 Sending upload request...');
        
        // Upload file and extract content
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: uploadFormData
        });

        console.log('📥 Upload response status:', uploadResponse.status);

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json().catch(() => ({}));
          console.error('❌ Upload failed:', errorData);
          throw new Error(errorData.error || `HTTP ${uploadResponse.status}: Failed to upload ${file.name}`);
        }

        const uploadResult = await uploadResponse.json();
        console.log('✅ Upload successful:', uploadResult);

        // Add the uploaded material with extracted content
        const newMaterial = {
          title: file.name,
          fileType: file.type,
          fileUrl: uploadResult.fileUrl,
          content: uploadResult.extractedContent || '', // This is key for RAG integration
          uploadedAt: new Date()
        };

        setFormData(prev => ({
          ...prev,
          materials: [...prev.materials, newMaterial]
        }));

        toast.success(`${file.name} uploaded successfully`);
        console.log(`🎉 Material added for ${file.name} with ${uploadResult.contentLength} characters of content`);
        
      } catch (error) {
        console.error(`💥 Error uploading ${file.name}:`, error);
        toast.error(`Error uploading file: ${error.message}`);
      }
    }
    
    // Clear the file input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsUpdating(true);
      const res = await fetch(`/api/lectures/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        toast.success("Lecture updated successfully");
        onLectureUpdated?.();
        onClose();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to update lecture');
      }
    } catch (error) {
      console.error('Error updating lecture:', error);
      toast.error(error.message || 'Failed to update lecture');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-neutral-800">
          <h2 className="text-xl font-semibold text-white">Edit Lecture</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="text-yellow-400">Loading lecture data...</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-6">
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Basic Information</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-white mb-2">Title</label>
                        <input
                          name="title"
                          type="text"
                          className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                          value={formData.title}
                          onChange={handleChange}
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-white mb-2">Description</label>
                        <textarea
                          name="description"
                          className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                          rows="4"
                          value={formData.description}
                          onChange={handleChange}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-white mb-2">Start Date</label>
                          <input
                            type="datetime-local"
                            name="startDate"
                            className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-white mb-2">End Date</label>
                          <input
                            type="datetime-local"
                            name="endDate"
                            className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                            value={formData.endDate}
                            onChange={handleChange}
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-white mb-2">Status</label>
                        <select
                          name="status"
                          className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                          value={formData.status}
                          onChange={handleChange}
                        >
                          <option value="scheduled">Scheduled</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Settings */}
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Settings</h3>
                    <div className="space-y-4">
                      <label className="flex items-center space-x-2 text-white">
                        <input
                          type="checkbox"
                          name="copyPasteRestricted"
                          checked={formData.copyPasteRestricted}
                          onChange={handleChange}
                          className="rounded border-neutral-600"
                        />
                        <span>Restrict Copy/Paste</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Right Column - Materials & FAQs */}
                <div className="space-y-6">
                  {/* Materials Section */}
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Lecture Materials</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-center w-full">
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-neutral-700 text-yellow-500 rounded-lg tracking-wide border-2 border-dashed border-neutral-600 cursor-pointer hover:bg-neutral-600">
                          <Upload className="w-8 h-8" />
                          <span className="mt-2 text-sm">Upload materials</span>
                          <input 
                            type='file' 
                            className="hidden" 
                            multiple 
                            onChange={handleFileUpload}
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          />
                        </label>
                      </div>
                      
                      {/* Materials List */}
                      <div className="space-y-3">
                        {formData.materials.map((material, index) => (
                          <div key={index} className="flex items-center justify-between bg-neutral-700 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              <File className="text-yellow-500 w-5 h-5" />
                              <span className="text-white">{material.title}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveMaterial(index)}
                              className="text-neutral-400 hover:text-red-500"
                            >
                              <Trash className="w-5 h-5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* FAQs Section */}
                  <div className="bg-neutral-800 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Frequently Asked Questions</h3>
                    
                    <div className="space-y-4">
                      {/* FAQ Input */}
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Question"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                          className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                        />
                        <textarea
                          placeholder="Answer"
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                          className="w-full px-3 py-2 bg-neutral-700 text-white rounded border border-neutral-600 focus:border-yellow-500 focus:outline-none"
                          rows="3"
                        />
                        <button
                          type="button"
                          onClick={handleAddFaq}
                          className="flex items-center gap-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400"
                        >
                          <Plus className="w-4 h-4" />
                          Add FAQ
                        </button>
                      </div>

                      {/* FAQ List */}
                      <div className="space-y-3">
                        {formData.faqs.map((faq, index) => (
                          <div key={index} className="bg-neutral-700 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="text-yellow-400 font-medium">{faq.question}</h4>
                              <button
                                type="button"
                                onClick={() => handleRemoveFaq(index)}
                                className="text-neutral-400 hover:text-red-500"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-gray-300 text-sm">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end gap-4 pt-6 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 bg-neutral-700 text-white rounded-lg hover:bg-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className={`px-6 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 ${
                    isUpdating ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUpdating ? 'Updating...' : 'Update Lecture'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditLectureModal;
