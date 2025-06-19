import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    specialization: { type: String, required: true },
    governorate: { type: String, required: true },
    recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // relation to User (recruiter)
    created_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['open', 'closed'], default: 'open' }
});

const Job = mongoose.model('Job', jobSchema);

export default Job;