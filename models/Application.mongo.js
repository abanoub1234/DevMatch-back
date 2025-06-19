// const mongoose = require('mongoose');

// const applicationSchema = new mongoose.Schema({
//   id: String,
//   job_id: String,
//   applicant_id: String,
//   cover_letter: String,
//   cv_url: String,
//   cv_file: String,
//   status: String,
//   applied_at: Date
// });

// module.exports = mongoose.model('Application', applicationSchema);



// Maria
import mongoose from 'mongoose';

const applicationSchema = new mongoose.Schema({
    job_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true }, // Reference to Job
    applicant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Reference to User (programmer)
    cover_letter: { type: String, required: false },
    cv_url: { type: String, required: false },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    applied_at: { type: Date, default: Date.now }
});

const Application = mongoose.model('Application', applicationSchema);

export default Application;