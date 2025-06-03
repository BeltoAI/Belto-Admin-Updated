import mongoose from 'mongoose';

const generalFeedbackSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    trim: true
  },
  q1_helpfulness: {
    type: String,
    required: true,
    trim: true
  },
  q2_frustrations: {
    type: String,
    required: true,
    trim: true
  },
  q3_improvement: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const GeneralFeedback = mongoose.models.GeneralFeedback || mongoose.model('GeneralFeedback', generalFeedbackSchema);
export default GeneralFeedback;