// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['professor', 'student', 'admin'],
    default: 'professor'
  },
  classes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Class'
  }],
  verificationToken: String,
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  googleId: String, // Add Google ID field
  profilePicture: String // Add profile picture field from Google
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);