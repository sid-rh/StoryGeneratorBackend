const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  // author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  createdBy: {
    _user: { type: mongoose.Schema.Types.ObjectId },
    date: { type: Date, default: Date.now },
  },
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  saves: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: {
    type: Date,
    default: Date.now, // Set the default value to the current date and time
  },
  editedAt:{
    type:Date,
  }
  
},
{
  timestamps: true,
},);

const Story = mongoose.model('Story', storySchema);

module.exports = Story;