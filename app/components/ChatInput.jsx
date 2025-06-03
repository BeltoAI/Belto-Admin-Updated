import {
  FileUp,
  SquareArrowUp,
  X
} from 'lucide-react';

const ChatInput = ({
  currentInput,
  setCurrentInput,
  currentAttachments,
  setCurrentAttachments,
  handleSubmit,
  fileInputRef,
  handleFileUpload,
  isGenerating
}) => {
  // Function to remove a file from the selected files
  const handleRemoveFile = (index) => {
    const updatedFiles = currentAttachments.filter((_, i) => i !== index);
    setCurrentAttachments(updatedFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-[#1A1A1A] border-t border-[#262626]">
      {/* Display selected files in a horizontal scrollable list */}
      {currentAttachments.length > 0 && (
        <div className="flex space-x-2 mb-2 overflow-x-auto scrollbar-hide">
          {currentAttachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center space-x-2 p-2 bg-[#262626] rounded-md flex-shrink-0"
            >
              <span className="text-sm text-white truncate max-w-[100px]">{file.name}</span>
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="p-1 hover:bg-[#333333] rounded-md transition-colors"
              >
                <X className="w-4 h-4 text-yellow-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* File input and text input */}
      <div className="flex items-center space-x-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          className="hidden"
          multiple
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`p-2 hover:bg-[#262626] rounded-md transition-colors ${
            isGenerating ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={isGenerating}
        >
          <FileUp className="w-5 h-5 text-[#FFD700]" />
        </button>
        <input
          type="text"
          value={currentInput}
          onChange={(e) => setCurrentInput(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 bg-transparent border-none focus:outline-none text-white"
          disabled={isGenerating}
        />
        <button
          type="submit"
          className={`p-2 hover:bg-[#262626] rounded-md transition-colors ${
            (isGenerating || (!currentInput.trim() && currentAttachments.length === 0))
              ? 'opacity-50 cursor-not-allowed'
              : ''
          }`}
          disabled={isGenerating || (!currentInput.trim() && currentAttachments.length === 0)}
        >
          <SquareArrowUp className="w-6 h-6 text-[#FFD700]" />
        </button>
      </div>
    </form>
  );
};

export default ChatInput;