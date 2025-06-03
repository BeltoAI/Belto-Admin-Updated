// controls/SearchFilter.jsx
"use client";
import { FiSearch, FiChevronDown, FiPlus } from 'react-icons/fi';
import { useRouter } from 'next/navigation';

const SearchFilter = ({ searchQuery, filter, onSearch, onFilter, onAddClass }) => {
  const router = useRouter();

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4 md:mb-6 gap-4">
      <h2 className="text-gray-400 text-base md:text-lg">List of Classes</h2>
      
      <div className="w-full md:w-auto flex flex-col sm:flex-row gap-3 md:gap-4">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
          <input
            type="text"
            placeholder="Search classes"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            className="bg-gray-800 rounded-md pl-10 pr-4 py-2 text-gray-200 w-full
              focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm md:text-base"
          />
        </div>

        <div className="relative flex-1 sm:flex-none">
          <select
            value={filter}
            onChange={(e) => onFilter(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-md appearance-none w-full
              hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 text-sm md:text-base"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
          <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
        </div>

        <button
          onClick={() => router.push('/class-management/create')}
          className="bg-yellow-500 text-black p-2 rounded-md hover:bg-yellow-400
            transition-colors flex items-center justify-center w-full sm:w-auto
            text-sm md:text-base"
          aria-label="Add new class"
        >
          <FiPlus className="w-5 h-5 md:w-6 md:h-6" />
          <span className="hidden sm:inline ml-2">Add Class</span>
        </button>
      </div>
    </div>
  );
};

export default SearchFilter;