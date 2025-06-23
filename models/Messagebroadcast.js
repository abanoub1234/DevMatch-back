import mongoose from  'mongoose';
import User from '../models/User.mongo.js';
const messagebroadcastSchema = new mongoose.Schema({
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
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }]
  , 
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });


const Messagebroadcast = mongoose.model("Messagebroadcast", messagebroadcastSchema);

export default Messagebroadcast;