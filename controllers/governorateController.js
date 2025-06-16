const Governorate = require('../models/Governorate.mongo');

exports.getAllGovernorates = async (req, res) => {
  try {
    const govs = await Governorate.find();
    res.json(govs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGovernorateById = async (req, res) => {
  try {
    const gov = await Governorate.findById(req.params.id);
    if (!gov) return res.status(404).json({ message: 'Governorate not found' });
    res.json(gov);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createGovernorate = async (req, res) => {
  try {
    const newGov = new Governorate(req.body);
    await newGov.save();
    res.status(201).json(newGov);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateGovernorate = async (req, res) => {
  try {
    const gov = await Governorate.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!gov) return res.status(404).json({ message: 'Governorate not found' });
    res.json(gov);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteGovernorate = async (req, res) => {
  try {
    const result = await Governorate.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Governorate not found' });
    res.json({ message: 'Governorate deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
