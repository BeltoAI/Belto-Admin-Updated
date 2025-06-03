// components/EditForm.jsx
"use client";
import { useState } from 'react';
import DatePicker from '../controls/DatePicker';
import { FiSave, FiX } from 'react-icons/fi';

const EditForm = ({ classItem, onSave, onCancel }) => {
  const [editedClass, setEditedClass] = useState({
    ...classItem,
    schedule: classItem.schedule || []
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(editedClass);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedClass(prev => ({ ...prev, [name]: value }));
  };

  const handleScheduleChange = (day, time) => {
    const newSchedule = editedClass.schedule.includes(`${day}-${time}`)
      ? editedClass.schedule.filter(s => s !== `${day}-${time}`)
      : [...editedClass.schedule, `${day}-${time}`];
    
    setEditedClass(prev => ({ ...prev, schedule: newSchedule }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      <div>
        <label className="text-gray-400 block mb-2 text-sm md:text-base">Class Name:</label>
        <input
          type="text"
          name="name"
          value={editedClass.name}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white rounded-md p-2 md:p-3 text-sm md:text-base focus:ring-2 focus:ring-yellow-500"
          required
        />
      </div>

      <div>
        <label className="text-gray-400 block mb-2 text-sm md:text-base">Description:</label>
        <textarea
          name="description"
          value={editedClass.description}
          onChange={handleChange}
          className="w-full bg-gray-800 text-white rounded-md p-2 md:p-3 text-sm md:text-base focus:ring-2 focus:ring-yellow-500"
          rows={4}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
        <div>
          <label className="text-gray-400 block mb-2 text-sm md:text-base">Students:</label>
          <input
            type="number"
            name="students"
            value={editedClass.students}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white rounded-md p-2 md:p-3 text-sm md:text-base"
          />
        </div>
        <div>
          <label className="text-gray-400 block mb-2 text-sm md:text-base">Enrollment Code:</label>
          <input
            type="text"
            name="enrollmentCode"
            value={editedClass.enrollmentCode}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white rounded-md p-2 md:p-3 text-sm md:text-base"
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 block mb-2 text-sm md:text-base">Dates:</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <DatePicker
            label="Start Date"
            value={editedClass.startDate}
            onChange={(date) => setEditedClass(prev => ({ ...prev, startDate: date }))}
          />
          <DatePicker
            label="End Date"
            value={editedClass.endDate}
            onChange={(date) => setEditedClass(prev => ({ ...prev, endDate: date }))}
          />
        </div>
      </div>

      <div>
        <label className="text-gray-400 block mb-2 text-sm md:text-base">Class Schedule:</label>
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {['Monday', 'Wednesday', 'Friday'].map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleScheduleChange(day, '10:00-11:00')}
              className={`p-2 rounded-md transition-colors ${
                editedClass.schedule.includes(`${day}-10:00-11:00`) 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {day} 10-11am
            </button>
          ))}
          {['Tuesday', 'Thursday'].map(day => (
            <button
              key={day}
              type="button"
              onClick={() => handleScheduleChange(day, '18:00-19:00')}
              className={`p-2 rounded-md transition-colors ${
                editedClass.schedule.includes(`${day}-18:00-19:00`) 
                  ? 'bg-yellow-500 text-black' 
                  : 'bg-gray-800 text-white hover:bg-gray-700'
              }`}
            >
              {day} 6-7pm
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 md:gap-4 mt-6">
        <button
          type="submit"
          className="flex items-center justify-center bg-yellow-500 text-black px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-yellow-400 text-sm md:text-base"
        >
          <FiSave className="mr-2 w-4 h-4 md:w-5 md:h-5" />
          Save Changes
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center justify-center bg-gray-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-md hover:bg-gray-600 text-sm md:text-base"
        >
          <FiX className="mr-2 w-4 h-4 md:w-5 md:h-5" />
          Cancel
        </button>
      </div>
    </form>
  );
};

export default EditForm;