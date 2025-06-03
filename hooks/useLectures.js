import { useState, useEffect } from 'react';

export const useLectures = (classId) => {
  const [lectures, setLectures] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLectures = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/classes/${classId}/lectures`);
      if (!response.ok) throw new Error('Failed to fetch lectures');
      const data = await response.json();
      setLectures(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (classId) {
      fetchLectures();
    }
  }, [classId]); // Only fetch when classId changes

  const createLecture = async (lectureData) => {
    try {
      const response = await fetch(`/api/classes/${classId}/lectures`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(lectureData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create lecture');
      }

      const newLecture = await response.json();
      setLectures(prev => [...prev, newLecture]);
      return newLecture;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const updateLecture = async (lectureId, updateData) => {
    try {
      const response = await fetch(`/api/classes/${classId}/lectures/${lectureId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update lecture');
      }

      const updatedLecture = await response.json();
      setLectures(prev => 
        prev.map(lecture => 
          lecture._id === lectureId ? updatedLecture : lecture
        )
      );
      return updatedLecture;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteLecture = async (lectureId) => {
    try {
      const response = await fetch(`/api/classes/${classId}/lectures/${lectureId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete lecture');
      }

      setLectures(prev => 
        prev.filter(lecture => lecture._id !== lectureId)
      );
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    lectures,
    loading,
    error,
    createLecture,
    updateLecture,
    deleteLecture
  };
};