const Specialization = require('../models/Specialization.mongo');

exports.getAllSpecializations = async (req, res) => {
  try {
    const specs = await Specialization.find();
    res.json(specs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSpecializationById = async (req, res) => {
  try {
    const spec = await Specialization.findById(req.params.id);
    if (!spec) return res.status(404).json({ message: 'Specialization not found' });
    res.json(spec);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSpecialization = async (req, res) => {
  try {
    const newSpec = new Specialization(req.body);
    await newSpec.save();
    res.status(201).json(newSpec);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateSpecialization = async (req, res) => {
  try {
    const spec = await Specialization.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!spec) return res.status(404).json({ message: 'Specialization not found' });
    res.json(spec);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteSpecialization = async (req, res) => {
  try {
    const result = await Specialization.findByIdAndDelete(req.params.id);
    if (!result) return res.status(404).json({ message: 'Specialization not found' });
    res.json({ message: 'Specialization deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
