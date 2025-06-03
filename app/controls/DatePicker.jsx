"use client";
import { FiCalendar } from 'react-icons/fi';

const DatePicker = ({ label, value, onChange }) => {
  return (
    <div className="relative">
      <label className="text-gray-400 block mb-2">{label}</label>
      <div className="relative">
        <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md pl-10 pr-4 py-2
            focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none"
          min="2024-01-01"
          max="2026-12-31"
        />
      </div>
    </div>
  );
};

export default DatePicker;