"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const EditClassPage = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    enrollmentCode: '',
    enrollmentUrl: '',
    aiSettings: {
      model: 'Zypher 7B',
      copyPasteRestriction: false,
      temperature: 0.8
    }
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchClass = async () => {
      try {
        const response = await fetch(`/api/classes?id=${id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch class data');
        }
        
        const data = await response.json();
        
        // Format dates for input fields
        const formattedData = {
          ...data,
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          endDate: new Date(data.endDate).toISOString().split('T')[0]
        };
        
        setFormData(formattedData);
      } catch (error) {
        console.error('Fetch Error:', error);
        toast.error(error.message || 'Failed to load class data');
        router.push('/class-management');
      } finally {
        setLoading(false);
      }
    };

    fetchClass();
  }, [id, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Update enrollment URL based on enrollment code
      const updatedData = {
        ...formData,
        enrollmentUrl: `/enroll/${formData.enrollmentCode}`
      };

      const response = await fetch(`/api/classes?id=${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update class');
      }

      toast.success('Class updated successfully');
      router.push('/class-management');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('aiSettings.')) {
      const settingName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        aiSettings: {
          ...prev.aiSettings,
          [settingName]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
        // Update enrollment URL automatically when enrollment code changes
        ...(name === 'enrollmentCode' ? { enrollmentUrl: `/enroll/${value}` } : {})
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black p-8 flex justify-center items-center">
        <div className="text-yellow-500">Loading class data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="mb-6 text-yellow-500 hover:text-yellow-400 flex items-center"
        >
          <FiArrowLeft className="mr-2" /> Back to Classes
        </button>

        <h1 className="text-2xl md:text-3xl font-semibold text-white mb-8">Edit Class</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1C1C1C] p-6 rounded-lg space-y-4">
            <div>
              <label className="block text-gray-300 mb-2">Class Name *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                name="description"
                className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                rows="3"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-300 mb-2">Start Date *</label>
                <input
                  type="date"
                  name="startDate"
                  required
                  className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.startDate}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-gray-300 mb-2">End Date *</label>
                <input
                  type="date"
                  name="endDate"
                  required
                  className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  value={formData.endDate}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Enrollment Code *</label>
              <input
                type="text"
                name="enrollmentCode"
                required
                className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData.enrollmentCode}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-gray-300 mb-2">Enrollment URL</label>
              <input
                type="text"
                name="enrollmentUrl"
                readOnly
                className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500 opacity-75"
                value={formData.enrollmentUrl}
              />
              <p className="text-gray-500 text-sm mt-1">
                This URL is automatically generated from the enrollment code
              </p>
            </div>

            <div className="pt-4 border-t border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">AI Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-300 mb-2">Model</label>
                  <select
                    name="aiSettings.model"
                    className="w-full bg-gray-800 rounded-md px-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    value={formData.aiSettings.model}
                    onChange={handleChange}
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
                    name="aiSettings.copyPasteRestriction"
                    className="w-4 h-4 text-yellow-500 bg-gray-800 rounded focus:ring-yellow-500"
                    checked={formData.aiSettings.copyPasteRestriction}
                    onChange={handleChange}
                  />
                  <label htmlFor="copyPaste" className="text-gray-300">
                    Enable Copy-Paste Restriction
                  </label>
                </div>

                <div>
                  <label className="block text-gray-300 mb-2">
                    Temperature ({formData.aiSettings.temperature})
                  </label>
                  <input
                    type="range"
                    name="aiSettings.temperature"
                    min="0"
                    max="1"
                    step="0.1"
                    className="w-full"
                    value={formData.aiSettings.temperature}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-500 text-black py-2 rounded-md hover:bg-yellow-400 transition-colors font-medium disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update Class'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditClassPage;