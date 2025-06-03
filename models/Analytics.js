import mongoose from 'mongoose';


const AnalyticsSchema = new mongoose.Schema({
    classId: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
    date: { type: Date, default: Date.now },
    totalTimeUsed: Number,
    totalPrompts: Number,
    sentimentTrends: [{ lectureId: mongoose.ObjectId, sentiment: String }],
});

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);