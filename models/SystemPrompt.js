import mongoose from 'mongoose';

const SystemPromptSchema = new mongoose.Schema({
  lectureId: {
    type: String,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the timestamp when document is updated
SystemPromptSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Prevent duplicate system prompts for the same lecture
SystemPromptSchema.index({ lectureId: 1, name: 1 }, { unique: true });

export default mongoose.models.SystemPrompt || mongoose.model('SystemPrompt', SystemPromptSchema);