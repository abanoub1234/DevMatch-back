import mongoose from  'mongoose';

const commentSchema = new mongoose.Schema({
  message: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message',
    required: true
  },
   user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
 
  text: {
    type: String,
    required: true
  },
  time: {
    type: String,
    default: () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }
}, { timestamps: true });

const Comment = mongoose.model('Comment', commentSchema);
export default Comment;