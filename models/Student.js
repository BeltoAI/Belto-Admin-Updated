// models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    analytics: {
        timeSpent: { type: String, default: '0h' },
        promptsMade: { type: Number, default: 0 },
        likesGiven: { type: Number, default: 0 },
        dislikesGiven: { type: Number, default: 0 },
        filesUploaded: { type: Number, default: 0 }
    },
    lastActive: {
        type: Date,
        default: Date.now
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
});

// Ensure model is registered only once
const Student = mongoose.models.Student || mongoose.model('Student', studentSchema);
export default Student;