const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, required: true },
  registration_date: { type: Date, default: Date.now },
  location: String,
  company_name: String,
  company_description: String,
  company_website: String,
  company_size: String,
  linkedin: String,
  image: String,
  cv_url: String,
  experience: Number,
  skills: String,
  technology: [String],
  isProfileComplete: { type: Boolean, default: false },
  aboutMe: String
});

module.exports = mongoose.model('User', userSchema);
