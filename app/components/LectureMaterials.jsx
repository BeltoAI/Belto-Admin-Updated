"use client";
import { useState } from 'react';
import { FiFile, FiVideo, FiPlus, FiTrash, FiEdit, FiDownload } from 'react-icons/fi';

const LectureMaterials = ({ materials, onUpdate }) => {
  const [newMaterial, setNewMaterial] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAdd = () => {
    if (newMaterial.trim()) {
      onUpdate([...materials, {
        id: Date.now(),
        title: newMaterial,
        type: 'document',
        uploadDate: new Date().toISOString()
      }]);
      setNewMaterial('');
    }
  };

  const handleEdit = (id) => {
    const material = materials.find(m => m.id === id);
    setEditingId(id);
    setEditText(material.title);
  };

  const saveEdit = () => {
    onUpdate(materials.map(m => 
      m.id === editingId ? { ...m, title: editText } : m
    ));
    setEditingId(null);
  };

  return (
    <div className="mb-8">
      <h3 className="text-gray-400 mb-4">Lecture Materials</h3>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          placeholder="Add new material"
          value={newMaterial}
          onChange={(e) => setNewMaterial(e.target.value)}
          className="bg-gray-800 text-white rounded-md px-3 py-2 flex-1"
        />
        <button
          onClick={handleAdd}
          className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400"
        >
          <FiPlus className="inline-block mr-2" />
          Add
        </button>
      </div>

      <div className="space-y-3">
        {materials.map(material => (
          <div key={material.id} className="flex items-center justify-between bg-gray-800 p-3 rounded-md">
            <div className="flex items-center gap-3 flex-1">
              {material.type === 'video' ? (
                <FiVideo className="text-red-500" />
              ) : (
                <FiFile className="text-blue-500" />
              )}
              {editingId === material.id ? (
                <input
                  type="text"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="bg-gray-700 text-white px-2 py-1 rounded-md flex-1"
                />
              ) : (
                <span className="text-gray-300 flex-1">{material.title}</span>
              )}
            </div>
            
            <div className="flex gap-2 ml-4">
              {editingId === material.id ? (
                <button
                  onClick={saveEdit}
                  className="text-green-500 hover:text-green-400"
                >
                  Save
                </button>
              ) : (
                <>
                  <button
                    onClick={() => handleEdit(material.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => onUpdate(materials.filter(m => m.id !== material.id))}
                    className="text-red-500 hover:text-red-400"
                  >
                    <FiTrash />
                  </button>
                </>
              )}
              <button
                className="text-gray-400 hover:text-white"
                onClick={() => window.open(material.url, '_blank')}
              >
                <FiDownload />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LectureMaterials;