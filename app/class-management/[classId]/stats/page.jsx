import Link from 'next/link';
import React from 'react';
import { FiChevronLeft } from 'react-icons/fi';

async function getFeedbacks(classId) {
  const res = await fetch(`/api/feedback?classId=${classId}`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch feedbacks');
  return res.json();
}

const AnalyticsAndFeedback = async ({ params }) => {
  const { classId } = params;
  const { feedbacks } = await getFeedbacks(classId);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-4 md:mb-6">
          <Link
           href="/class-management" 
           className="text-gray-400 hover:text-gray-300 transition-colors">
            <FiChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
          </Link>
          <h1 className="text-xl md:text-2xl font-semibold text-white ml-2 md:ml-4">Analytics & Feedback</h1>
        </div>

        {/* Sentiment Analysis Section */}
        <div className="bg-[#111111] rounded-xl p-4 md:p-6 mt-4 md:mt-6">
          <h2 className="text-gray-300 text-sm md:text-base">Sentiment Analysis</h2>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 md:gap-6 mt-4 md:mt-6">
            <button className="bg-[#1a1a1a] rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-yellow-400 hover:bg-[#252525] transition-colors">
              Good Feedback
            </button>
            <button className="bg-[#1a1a1a] rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-red-400 hover:bg-[#252525] transition-colors">
              Bad Feedback
            </button>
            <button className="bg-[#1a1a1a] rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-400 hover:bg-[#252525] transition-colors">
              Overall Feedback
            </button>
            <button className="bg-[#1a1a1a] rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-400 hover:bg-[#252525] transition-colors">
              Clarity
            </button>
            <button className="bg-[#1a1a1a] rounded-lg px-3 md:px-4 py-2 md:py-3 text-sm md:text-base text-gray-400 hover:bg-[#252525] transition-colors">
              Pacing
            </button>
          </div>
          <div className="mt-4 md:mt-6 space-y-3 md:space-y-4">
            <div>
              <h3 className="text-gray-400 text-sm md:text-base">Content Clarity:</h3>
              <p className="text-gray-500 text-xs md:text-sm">
                The lecture was well-structured, and the concepts were explained clearly.
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm md:text-base">Engagement:</h3>
              <p className="text-gray-500 text-xs md:text-sm">
                The interactive examples and questions kept me engaged.
              </p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm md:text-base">Support Materials:</h3>
              <p className="text-gray-500 text-xs md:text-sm">
                The slides and materials complemented the lecture well.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback List Section */}
        <div className="bg-[#111111] rounded-xl p-4 md:p-6 mt-4 md:mt-6">
          <h2 className="text-gray-300 text-lg md:text-xl font-semibold mb-4">Student Feedbacks</h2>
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="bg-[#1a1a1a] rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-gray-200 font-medium">{feedback.studentId.username}</h3>
                    <p className="text-gray-400 text-sm">{feedback.studentId.email}</p>
                  </div>
                  <div className="bg-yellow-400/10 px-2 py-1 rounded">
                    <span className="text-yellow-400 text-sm">Rating: {feedback.rating}/5</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm">{feedback.review}</p>
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(feedback.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsAndFeedback;