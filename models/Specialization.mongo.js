const mongoose = require('mongoose');

const specializationSchema = new mongoose.Schema({
  spec_id: Number,
  name: String,
  id: String
});

module.exports = mongoose.model('Specialization', specializationSchema);
