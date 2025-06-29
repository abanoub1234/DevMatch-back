import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    specialization: { type: String, required: true },
    governorate: { type: String, required: true },
    recruiter_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // relation to User (recruiter)
    created_at: { type: Date, default: Date.now },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    work_mode: { type: String, enum: ['onsite', 'remotely'], required: true }, // onsite or remotely
    job_type: { type: String, enum: ['full-time', 'part-time', 'by task'], required: true } // job type
});

const Job = mongoose.model('Job', jobSchema);

export default Job;