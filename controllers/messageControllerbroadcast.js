import Messagebroadcast from '../models/Messagebroadcast.js';
import Comment from '../models/Comment.js';

export const getAllMessages = async (req, res) => {
  try {
    const messages = await Messagebroadcast.find()
      .populate('user', '_id name image') // Added _id
      .populate({
        path: 'comments',
        populate: { path: 'user', select: '_id name image' } // Added _id
      });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createMessage = async (req, res) => {
  try {
    const newMessage = new Messagebroadcast({
      user: req.user.id,
      text: req.body.text
    });
    const savedMessage = await newMessage.save();
    const populatedMessage = await Messagebroadcast.findById(savedMessage._id)
      .populate('user', '_id name image'); // Added _id
    res.status(201).json(populatedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getMessageById = async (req, res) => {
  try {
    const message = await Messagebroadcast.findById(req.params.id).populate('comments');
    if (!message) return res.status(404).json({ message: 'Message not found' });
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateMessage = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid message ID format' });
    }
    const message = await Messagebroadcast.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    message.text = req.body.text || message.text;
    await message.save();
    const updatedMessage = await Messagebroadcast.findById(message._id)
      .populate('user', '_id name image') // Added _id
      .populate({
        path: 'comments',
        populate: { path: 'user', select: '_id name image' } // Added _id
      });
    res.json(updatedMessage);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid message ID format' });
    }
    const message = await Messagebroadcast.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    await Comment.deleteMany({ message: message._id });
    await Messagebroadcast.deleteOne({ _id: message._id });
    res.json({ message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};