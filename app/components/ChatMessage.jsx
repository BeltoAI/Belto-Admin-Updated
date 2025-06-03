"use client";

import React, { useState } from 'react';
import { Paperclip, ThumbsUp, ThumbsDown, Copy, Trash2, X } from 'lucide-react';
import { Loader2 } from 'lucide-react'; 
import Image from 'next/image';

const ChatMessage = ({
  isBot,
  avatar,
  name,
  message,
  suggestions,
  attachments,
  onLike,
  onDislike,
  onCopy,
  onDelete,
  liked,
  disliked,
}) => {
  const [isDeleting, setIsDeleting] = useState(false); 

  // Function to handle delete action
  const handleDelete = async () => {
    setIsDeleting(true); // Show loader
    await onDelete(); // Call the delete function
    setIsDeleting(false); // Hide loader
  };

  return (
    <div className="px-4 py-3 hover:bg-[#1A1A1A] text-white relative">
      {/* Blur effect during deletion */}
      {isDeleting && (
        <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#FFB800] animate-spin" />
        </div>
      )}

      <div className="flex gap-3">
        <Image src={avatar} alt={name} width={32} height={32} className="w-8 h-8 rounded-full" />
        <div className="flex-1">
          <div className="flex items-center gap-1 mb-1">
            <span className="text-sm font-medium">
              {name === "BELTO" ? (
                <span>
                  <span className="text-[#FFB800]">B</span>ELTO
                </span>
              ) : (
                name
              )}
            </span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{message}</p>

          {/* Display attachments */}
          {attachments && attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-[#262626] px-2 py-1 rounded-md"
                >
                  <Paperclip className="w-4 h-4 text-[#FFB800]" />
                  <span className="text-sm text-gray-300">{file.name}</span>
                  <button className="hover:bg-[#363636] rounded-full p-1">
                    <X className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bot-specific actions */}
          {isBot && (
            <>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={onLike}
                  className="p-1 hover:bg-[#262626] rounded-md"
                >
                  <ThumbsUp
                    className={`w-4 h-4 ${liked ? 'text-[#FFB800]' : 'text-gray-400'}`}
                  />
                </button>
                <button
                  onClick={onDislike}
                  className="p-1 hover:bg-[#262626] rounded-md"
                >
                  <ThumbsDown
                    className={`w-4 h-4 ${disliked ? 'text-[#FFB800]' : 'text-gray-400'}`}
                  />
                </button>
                <button
                  onClick={onCopy}
                  className="p-1 hover:bg-[#262626] rounded-md"
                >
                  <Copy className="w-4 h-4 text-gray-400" />
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting} // Disable button during deletion
                  className="p-1 hover:bg-[#262626] rounded-md"
                >
                  {isDeleting ? (
                    <Loader2 className="w-4 h-4 text-[#FFB800] animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </div>

              {/* Display suggestions */}
              {suggestions && suggestions.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="bg-[#1A1A1A] p-3 rounded-lg border border-[#262626]"
                    >
                      <div className="text-[#FFB800] text-sm mb-2">
                        Suggestion {index + 1}
                      </div>
                      <p className="text-sm text-gray-300">{suggestion}</p>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;