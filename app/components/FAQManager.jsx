"use client";
import { useState } from 'react';
import { FiPlus, FiTrash, FiEdit } from 'react-icons/fi';

const FAQManager = ({ faqs, onUpdate }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ q: '', a: '' });

  const handleAdd = () => {
    if (newQuestion.trim() && newAnswer.trim()) {
      onUpdate([...faqs, {
        id: Date.now(),
        question: newQuestion,
        answer: newAnswer
      }]);
      setNewQuestion('');
      setNewAnswer('');
    }
  };

  const startEdit = (faq) => {
    setEditingId(faq.id);
    setEditData({ q: faq.question, a: faq.answer });
  };

  const saveEdit = () => {
    onUpdate(faqs.map(f => 
      f.id === editingId ? { ...f, question: editData.q, answer: editData.a } : f
    ));
    setEditingId(null);
  };

  return (
    <div className="mb-8">
      <h3 className="text-gray-400 mb-4">FAQ Management</h3>

      <div className="mb-4 space-y-3">
        <input
          type="text"
          placeholder="New question"
          value={newQuestion}
          onChange={(e) => setNewQuestion(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md px-3 py-2"
        />
        <textarea
          placeholder="Answer"
          value={newAnswer}
          onChange={(e) => setNewAnswer(e.target.value)}
          className="w-full bg-gray-800 text-white rounded-md px-3 py-2"
        />
        <button
          onClick={handleAdd}
          className="bg-yellow-500 text-black px-4 py-2 rounded-md hover:bg-yellow-400"
        >
          <FiPlus className="inline-block mr-2" />
          Add FAQ
        </button>
      </div>

      <div className="space-y-3">
        {faqs.map(faq => (
          <div key={faq.id} className="bg-gray-800 p-3 rounded-md">
            {editingId === faq.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editData.q}
                  onChange={(e) => setEditData(prev => ({ ...prev, q: e.target.value }))}
                  className="w-full bg-gray-700 text-white px-2 py-1 rounded-md"
                />
                <textarea
                  value={editData.a}
                  onChange={(e) => setEditData(prev => ({ ...prev, a: e.target.value }))}
                  className="w-full bg-gray-700 text-white px-2 py-1 rounded-md"
                />
                <button
                  onClick={saveEdit}
                  className="text-green-500 hover:text-green-400 mr-2"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-200 font-medium">{faq.question}</p>
                    <p className="text-gray-400 text-sm">{faq.answer}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(faq)}
                      className="text-gray-400 hover:text-white"
                    >
                      <FiEdit />
                    </button>
                    <button
                      onClick={() => onUpdate(faqs.filter(f => f.id !== faq.id))}
                      className="text-red-500 hover:text-red-400"
                    >
                      <FiTrash />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQManager;