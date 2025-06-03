"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { nanoid } from 'nanoid';

const CreateClassPage = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    enrollmentCode: '',
    enrollmentUrl: '',
    aiSettings: {
      model: 'Llama 3',
      copyPasteRestriction: false,
      temperature: 0.8
    }
  });
  const [loading, setLoading] = useState(false);
  const [showTempInfo, setShowTempInfo] = useState(false);

  // Generate enrollment URL and code based on class name
  useEffect(() => {
    if (formData.name) {
      generateEnrollmentData(formData.name);
    }
  }, [formData.name]);

  const generateEnrollmentData = async (className) => {
    // Convert class name to slug format
    let slug = className.toLowerCase()
      .replace(/\s+/g, '-')        // Replace spaces with -
      .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
      .replace(/\-\-+/g, '-')      // Replace multiple - with single -
      .replace(/^-+/, '')          // Trim - from start of text
      .replace(/-+$/, '');         // Trim - from end of text
    
    // Generate short unique code
    const uniqueCode = nanoid(6);
    
    // Check if this code is already used
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch(`/api/classes/check-code?code=${uniqueCode}`, {
        headers: {
          'user': JSON.stringify(user)
        }
      });
      
      const data = await response.json();
      
      if (data.exists) {
        // If code exists, regenerate with a new unique part
        generateEnrollmentData(className);
        return;
      }
      
      // Set the URL and code in the form data
      setFormData(prev => ({
        ...prev,
        enrollmentCode: uniqueCode,
        enrollmentUrl: `${slug}/${uniqueCode}`
      }));
    } catch (error) {
      console.error("Error checking enrollment code:", error);
      // Fallback - just use the generated code without checking
      setFormData(prev => ({
        ...prev,
        enrollmentCode: uniqueCode,
        enrollmentUrl: `${slug}/${uniqueCode}`
      }));
    }
  };

  const regenerateCode = async () => {
    if (formData.name) {
      await generateEnrollmentData(formData.name);
    } else {
      toast.info("Please enter a class name first");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user': JSON.stringify(user)
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error === 'duplicate_code') {
          toast.error('Enrollment code already exists. Generating a new one...');
          await regenerateCode();
          throw new Error('Please submit the form again with the new enrollment code');
        } else {
          throw new Error(errorData.message || 'Failed to create class');
        }
      }

      toast.success('Class created successfully');
      router.push('/class-management');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-yellow-500 hover:text-yellow-400 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Classes
        </button>

        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-8">Create New Class</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1C1C1C] p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Class Name</label>
              <input
                type="text"
                required
                className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter class name"
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your class"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Start Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">End Date</label>
                <input
                  type="date"
                  required
                  className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.endDate}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Enrollment Code</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  required
                  className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.enrollmentCode}
                  readOnly
                  placeholder="Will be generated after entering class name"
                />
                <button 
                  type="button" 
                  onClick={regenerateCode}
                  disabled={!formData.name}
                  className="px-4 py-2 bg-gray-700 rounded-md hover:bg-gray-600 text-gray-200 disabled:opacity-50"
                >
                  Regenerate
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1">Unique code generated based on your class name</p>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Enrollment URL</label>
              <div className="flex items-center">
                <input
                  type="text"
                  required
                  className="w-full bg-gray-800 rounded-r-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.enrollmentUrl}
                  readOnly
                  placeholder="Will be generated after entering class name"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">URL contains class name slug and unique identifier</p>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">AI Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Model</label>
                  <select
                    className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formData.aiSettings.model}
                    onChange={(e) => setFormData({
                      ...formData,
                      aiSettings: { ...formData.aiSettings, model: e.target.value }
                    })}
                  >
                    <option value="Zypher 7B">Zypher 7B</option>
                    <option value="Llama 3">Llama 3</option>
                    <option value="GPT-3.5">GPT-3.5</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="copyPaste"
                    className="w-4 h-4 text-yellow-500 bg-gray-800 rounded focus:ring-yellow-500"
                    checked={formData.aiSettings.copyPasteRestriction}
                    onChange={(e) => setFormData({
                      ...formData,
                      aiSettings: { ...formData.aiSettings, copyPasteRestriction: e.target.checked }
                    })}
                  />
                  <label htmlFor="copyPaste" className="text-gray-300">
                    Enable Copy-Paste Restriction
                  </label>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-gray-300">
                      Temperature ({formData.aiSettings.temperature})
                    </label>
                    <div className="relative">
                      <FiInfo 
                        className="text-gray-400 hover:text-yellow-500 cursor-pointer" 
                        onMouseEnter={() => setShowTempInfo(true)}
                        onMouseLeave={() => setShowTempInfo(false)}
                      />
                      {showTempInfo && (
                        <div className="absolute z-10 w-64 p-3 bg-gray-800 text-sm text-gray-200 rounded-md shadow-lg -left-32 bottom-6">
                          <p>Temperature controls response randomness:</p>
                          <ul className="mt-1 ml-4 list-disc text-xs">
                            <li>Lower (0): More deterministic, focused responses</li>
                            <li>Medium (1): Balanced creativity and consistency</li>
                            <li>Higher (2): More random, creative responses</li>
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="2"
                    step="0.1"
                    className="w-full"
                    value={formData.aiSettings.temperature}
                    onChange={(e) => setFormData({
                      ...formData,
                      aiSettings: { ...formData.aiSettings, temperature: parseFloat(e.target.value) }
                    })}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>More Focused</span>
                    <span>More Creative</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 text-black py-2 rounded-md hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Class'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateClassPage;