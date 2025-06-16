const mongoose = require('mongoose');

const governorateSchema = new mongoose.Schema({
  governorate_id: Number,
  name: String,
  id: String
});

module.exports = mongoose.model('Governorate', governorateSchema);
