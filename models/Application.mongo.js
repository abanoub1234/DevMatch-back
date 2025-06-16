const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  id: String,
  job_id: String,
  applicant_id: String,
  cover_letter: String,
  cv_url: String,
  cv_file: String,
  status: String,
  applied_at: Date
});

module.exports = mongoose.model('Application', applicationSchema);
