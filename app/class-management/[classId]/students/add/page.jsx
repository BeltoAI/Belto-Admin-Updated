"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddStudents({ params }) {
    const router = useRouter();
    const [students, setStudents] = useState([]);
    const [selectedStudents, setSelectedStudents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const classId = params.classId;

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            const response = await fetch('/api/students');
            if (!response.ok) throw new Error('Failed to fetch students');
            const data = await response.json();
            setStudents(data.students);
        } catch (err) {
            setError(err.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await fetch(`/api/classes/${classId}/students`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    studentIds: selectedStudents
                }),
            });

            if (!response.ok) throw new Error('Failed to update class');
            router.push(`/class-management`);
            router.refresh();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleStudent = (studentId) => {
        setSelectedStudents(prev => 
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6 text-white">Add Students to Class</h1>
            
            {error && (
                <div className="bg-red-500/20 text-red-500 p-4 rounded mb-4">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {students.map((student) => (
                        <div
                            key={student._id}
                            className={`p-4 rounded-lg border cursor-pointer ${
                                selectedStudents.includes(student._id)
                                    ? 'border-yellow-500 bg-yellow-500/10'
                                    : 'border-gray-700 bg-gray-800'
                            }`}
                            onClick={() => toggleStudent(student._id)}
                        >
                            <div className="flex items-center space-x-3">
                                <input
                                    type="checkbox"
                                    checked={selectedStudents.includes(student._id)}
                                    onChange={() => toggleStudent(student._id)}
                                    className="form-checkbox h-5 w-5 text-yellow-500"
                                />
                                <div>
                                    <p className="text-white font-medium">{student.username}</p>
                                    <p className="text-gray-400 text-sm">{student.email}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-end gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || selectedStudents.length === 0}
                        className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-400 disabled:opacity-50"
                    >
                        {loading ? 'Adding...' : 'Add Selected Students'}
                    </button>
                </div>
            </form>
        </div>
    );
}
