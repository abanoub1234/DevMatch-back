const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  job_id: Number,
  recruiter_id: String,
  title: String,
  description: String,
  specialization_id: String,
  governorate_id: String,
  created_at: Date,
  status: String,
  id: String
});

module.exports = mongoose.model('Job', jobSchema);
