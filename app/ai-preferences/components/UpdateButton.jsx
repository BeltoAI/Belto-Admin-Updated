import React from 'react';
import { Loader2 } from 'lucide-react';

const UpdateButton = ({ isUpdating, onUpdate }) => {
  return (
    <div className="flex justify-end gap-2 mt-8">
      <button
        onClick={onUpdate}
        disabled={isUpdating}
        className="bg-yellow-400 text-black px-4 py-2 rounded-lg hover:bg-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
      >
        {isUpdating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Updating...
          </>
        ) : (
          "Update Preference"
        )}
      </button>
    </div>
  );
};

export default UpdateButton;