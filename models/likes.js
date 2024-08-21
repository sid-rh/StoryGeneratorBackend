const mongoose=require('mongoose');


const likeSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    story: { type: mongoose.Schema.Types.ObjectId, ref: 'Story' },

  },
  {
    timestamps: true,
  },);
  
  const Like = mongoose.model('Like', likeSchema);
  
  module.exports = Like;    