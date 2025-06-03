"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ClassItem from '../components/ClassItem';
import SearchFilter from '../controls/SearchFilter';
import { useSettings } from '@/hooks/useSettings';
import { FiAlertTriangle, FiInfo } from 'react-icons/fi';

const ClassList = () => {
  const router = useRouter();
  const { settings, loading: settingsLoading } = useSettings();
  const [classes, setClasses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      const response = await fetch('/api/classes', {
        headers: {
          'user': JSON.stringify(user)
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch classes');
      
      const data = await response.json();
      setClasses(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle class updates (archive/unarchive)
  const handleClassUpdate = (updatedClass) => {
    setClasses(prevClasses => 
      prevClasses.map(c => c._id === updatedClass._id ? updatedClass : c)
    );
  };

  // Handle class deletion
  const handleClassDelete = (deletedClassId) => {
    setClasses(prevClasses => prevClasses.filter(c => c._id !== deletedClassId));
  };

  const filteredClasses = classes.filter(classItem =>
    classItem.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
    (filter === 'all' || classItem.status === filter)
  );

  // Determine if global copy/paste policy applies
  const hasCopyPasteRestriction = !settings?.allowCopyPaste;
  const hasOverrideCapability = settings?.allowCopyPaste && settings?.copyPasteLectureOverride;

  if (loading || settingsLoading) {
    return (
      <div className="min-h-screen bg-black p-8 flex justify-center items-center">
        <div className="text-yellow-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="max-w-8xl mx-auto">
        <div className="mb-4 md:mb-6 lg:mb-8">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white">
            Class Management
          </h1>
        </div>

        {/* Settings policy notification */}
        {hasCopyPasteRestriction && (
          <div className="mb-6 p-4 bg-gray-500 bg-opacity-20 border border-yellow-500 rounded-lg">
            <div className="flex items-start gap-3">
              <FiAlertTriangle className="text-yellow-500 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-yellow-500 font-medium">Copy/Paste Restriction Active</h3>
                <p className="text-gray-300 text-sm mt-1">
                  Global copy/paste restriction is enabled in your settings. 
                  This will override any class-level settings.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lecture-level override capability notification */}
        {hasOverrideCapability && (
          <div className="mb-6 p-4 bg-blue-900 bg-opacity-10 border border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <FiInfo className="text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-blue-400 font-medium">Lecture-Level Override Enabled</h3>
                <p className="text-gray-300 text-sm mt-1">
                  You can set copy/paste restrictions at the lecture level for each class.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-6 md:mb-8">
          <SearchFilter
            searchQuery={searchQuery}
            filter={filter}
            onSearch={setSearchQuery}
            onFilter={setFilter}
            onAddClass={() => router.push('/class-management/create')}
          />
        </div>

        <div className="space-y-2 sm:space-y-3 md:space-y-4">
          {filteredClasses.map(classItem => (
            <ClassItem
              key={classItem._id}
              classItem={classItem}
              onUpdate={handleClassUpdate}
              onDelete={handleClassDelete}
              globalCopyPasteRestriction={hasCopyPasteRestriction}
              allowLectureOverride={hasOverrideCapability}
            />
          ))}
        </div>

        {filteredClasses.length === 0 && (
          <div className="text-center py-8 md:py-12">
            <p className="text-gray-400 text-sm md:text-base">
              No classes found matching your criteria
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassList;