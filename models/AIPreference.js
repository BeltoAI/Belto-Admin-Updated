import mongoose from 'mongoose';

const AIPreferenceSchema = new mongoose.Schema({
  lectureId: {
    type: String, // Using string to handle both ObjectId and string formats
    required: true,
    index: true
  },
  model: {
    type: String,
    required: true
  },
  maxTokens: {
    type: Number,
    required: false
  },
  numPrompts: {
    type: Number,
    required: false
  },
  accessUrl: {
    type: String,
    required: false
  },
  temperature: {
    type: Number,
    required: false,
    default: 0.7
  },
  streaming: {
    type: Boolean,
    required: false,
    default: true
  },
  formatText: {
    type: String,
    required: false
  },
  citationStyle: {
    type: String,
    required: false
  },
  tokenPredictionLimit: {
    type: Number,
    required: false
  },
  processingRules: {
    removeSensitiveData: {
      type: Boolean,
      default: true
    },
    allowUploads: {
      type: Boolean,
      default: true
    },
    formatText: {
      type: Boolean,
      default: true
    },
    removeHyperlinks: {
      type: Boolean,
      default: false
    },
    addCitations: {
      type: Boolean,
      default: false
    }
  },
  // Add systemPrompts field
  systemPrompts: [{
    name: {
      type: String,
      required: true
    },
    content: {
      type: String,
      required: true
    }
  }],
  // Field to store extracted content from URLs/websites
  extractedContent: [{
    url: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: false
    },
    content: {
      type: String,
      required: true
    },
    extractedAt: {
      type: Date,
      default: Date.now
    },    contentType: {
      type: String,
      enum: ['webpage', 'pdf', 'document', 'youtube', 'other'],
      default: 'webpage'
    },
    metadata: {
      wordCount: Number,
      language: String,
      encoding: String
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on document update
AIPreferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Make lectureId unique to ensure one preference set per lecture
AIPreferenceSchema.index({ lectureId: 1 }, { unique: true });

export default mongoose.models.AIPreference ||
  mongoose.model('AIPreference', AIPreferenceSchema);