import Messagebroadcast from '../models/Messagebroadcast.js';
import Comment from '../models/Comment.js';

export const createComment = async (req, res) => {
  try {
    if (!req.user.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format for comment' });
    }
    const newComment = new Comment({
      message: req.params.messageId,
      user: req.user.id,
      text: req.body.text
    });
    const savedComment = await newComment.save();
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('user', '_id name image'); // Added _id
    await Messagebroadcast.findByIdAndUpdate(
      req.params.messageId,
      { $push: { comments: savedComment._id } }
    );
    res.status(201).json(populatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    if (req.body.user && !req.body.user.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Invalid user ID format for comment' });
    }
    comment.text = req.body.text || comment.text;
    if (req.body.user) comment.user = req.body.user;
    await comment.save();
    const updatedComment = await Comment.findById(comment._id)
      .populate('user', '_id name image'); // Added _id
    res.json(updatedComment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ message: 'Comment not found' });
    await Messagebroadcast.findByIdAndUpdate(
      comment.message,
      { $pull: { comments: comment._id } }
    );
    await Comment.deleteOne({ _id: comment._id });
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};