// components/ActionButtons.jsx
"use client";
import { 
  FiEdit, 
  FiArchive, 
  FiTrash, 
  FiUsers, 
  FiBarChart2 
} from 'react-icons/fi';
import { useRouter } from 'next/navigation';
// import right arrow
import { MdKeyboardArrowRight } from 'react-icons/md';

const ActionButtons = ({ classItem, onEdit, onArchive, onDelete }) => {
  const router = useRouter();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* First Row - Lecture & Student Management */}
      <div className="grid grid-cols-1 md:flex gap-2">
        <button
          className="w-full bg-gray-800 text-yellow-500 font-medium py-2 rounded-md hover:bg-gray-700 flex items-center justify-center text-sm md:text-base"
          onClick={() => router.push('/lecture-student-management')}
        >
          <span className="truncate">Lecture & Student Management</span>
          <MdKeyboardArrowRight className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>

      {/* Second Row - Stats */}
      <div className="grid grid-cols-1 md:flex gap-2">
        <button
          className="w-full bg-gray-800 text-yellow-500 font-medium py-2 rounded-md hover:bg-gray-700 flex items-center justify-center text-sm md:text-base"
          onClick={() => router.push('/stats')}
        >
          <span className="truncate">View Stats</span>
          <MdKeyboardArrowRight className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
        </button>
      </div>


      {/* Third Row - Other Buttons */}
      <div className="grid grid-cols-1 md:flex gap-2">
        <button
          className="flex-1 bg-indigo-600 text-white font-medium py-2 rounded-md hover:bg-indigo-500 flex items-center justify-center text-sm md:text-base"
          onClick={onEdit}
        >
          <FiEdit className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
          <span className="truncate">Edit</span>
        </button>

        <button
          className="flex-1 bg-gray-700 text-white py-2 rounded-md hover:bg-gray-600 flex items-center justify-center text-sm md:text-base"
          onClick={onArchive}
        >
          <FiArchive className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
          <span className="truncate">Archive</span>
        </button>

        <button
          className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-500 flex items-center justify-center text-sm md:text-base"
          onClick={onDelete}
        >
          <FiTrash className="mr-1 md:mr-2 w-4 h-4 md:w-5 md:h-5" />
          <span className="truncate">Delete</span>
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;