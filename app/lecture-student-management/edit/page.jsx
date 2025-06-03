"use client";
import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { ArrowLeft, Plus, X, Upload, File } from 'lucide-react';

// Inner component that uses useSearchParams
const EditLectureContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const lectureId = searchParams.get('lectureId');
  const [lecture, setLecture] = useState(null);
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

  // New state for FAQ management
  const [newFaq, setNewFaq] = useState({ question: '', answer: '' });

  useEffect(() => {
    if (!lectureId) return;
    const fetchLecture = async () => {
      try {
        const res = await fetch(`/api/lectures/${lectureId}`);
        const data = await res.json();
        setLecture(data);
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
        console.error(error);
      }
    };
    fetchLecture();
  }, [lectureId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/lectures/${lectureId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success("Lecture Updated Successfully")
        router.push("/dashboard");
      }
    } catch (error) {
      console.error(error);
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
    if (!newFaq.question || !newFaq.answer) return;
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
  };

  // Handle file upload
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newMaterials = files.map(file => ({
      title: file.name,
      fileType: file.type,
      fileUrl: URL.createObjectURL(file),
      uploadedAt: new Date()
    }));

    setFormData(prev => ({
      ...prev,
      materials: [...prev.materials, ...newMaterials]
    }));
  };

  const handleRemoveMaterial = (index) => {
    setFormData(prev => ({
      ...prev,
      materials: prev.materials.filter((_, i) => i !== index)
    }));
  };

  if (!lecture) {
    return <div className="p-4 text-white">Loading...</div>;
  }

  return (
    <>
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-yellow-500 hover:text-yellow-400 mb-4"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Lecture
        </button>
        <h1 className="text-2xl font-semibold text-white">Edit Lecture</h1>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Basic Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-neutral-900 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Basic Information</h2>
            {/* Existing basic fields */}
            <div>
              <label className="block text-white mb-2">Title</label>
              <input
                name="title"
                className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
                value={formData.title}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-white mb-2">Description</label>
              <textarea
                name="description"
                className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
                rows="8"
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
                  className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-white mb-2">End Date</label>
                <input
                  type="datetime-local"
                  name="endDate"
                  className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-white mb-2">Status</label>
              <select
                name="status"
                className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
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

          {/* Materials Section */}
          <div className="bg-neutral-900 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Lecture Materials</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-center w-full">
                <label className="w-full flex flex-col items-center px-4 py-6 bg-neutral-800 text-yellow-500 rounded-lg tracking-wide border-2 border-dashed border-neutral-700 cursor-pointer hover:bg-neutral-700">
                  <Upload className="w-8 h-8" />
                  <span className="mt-2 text-sm">Upload materials</span>
                  <input type='file' className="hidden" multiple onChange={handleFileUpload} />
                </label>
              </div>
              
              {/* Materials List */}
              <div className="space-y-3">
                {formData.materials.map((material, index) => (
                  <div key={index} className="flex items-center justify-between bg-neutral-800 p-3 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <File className="text-yellow-500 w-5 h-5" />
                      <span className="text-white">{material.title}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveMaterial(index)}
                      className="text-neutral-400 hover:text-red-500"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* FAQs Section */}
          <div className="bg-neutral-900 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {/* FAQ Input */}
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Question"
                  value={newFaq.question}
                  onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
                />
                <textarea
                  placeholder="Answer"
                  value={newFaq.answer}
                  onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                  className="w-full px-3 py-2 bg-neutral-800 text-white rounded border border-neutral-700"
                  rows="3"
                />
                <button
                  onClick={handleAddFaq}
                  className="w-full px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add FAQ
                </button>
              </div>

              {/* FAQs List */}
              <div className="space-y-3">
                {formData.faqs.map((faq, index) => (
                  <div key={index} className="bg-neutral-800 p-4 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-yellow-500 font-medium">{faq.question}</h3>
                      <button
                        onClick={() => handleRemoveFaq(index)}
                        className="text-neutral-400 hover:text-red-500"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <p className="text-neutral-300">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings & Actions */}
        <div className="space-y-6">
          <div className="bg-neutral-900 rounded-xl p-6">
            <h2 className="text-lg font-medium text-white mb-4">Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-2 text-white">
                <input
                  type="checkbox"
                  name="copyPasteRestricted"
                  checked={formData.copyPasteRestricted}
                  onChange={handleChange}
                  className="rounded border-neutral-700"
                />
                <span>Restrict Copy/Paste</span>
              </label>
              {/* Add more settings here */}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="bg-neutral-900 rounded-xl p-6">
            <button
              type="button"
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 mb-3"
            >
              Update Lecture
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="w-full px-4 py-2 bg-neutral-800 text-white rounded-lg hover:bg-neutral-700"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Main component with Suspense boundary
const EditLecturePage = () => {
  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <Suspense fallback={<div className="p-4 text-white">Loading...</div>}>
        <EditLectureContent />
      </Suspense>
    </div>
  );
};

export default EditLecturePage;