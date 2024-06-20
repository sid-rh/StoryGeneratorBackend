const mongoose=require('mongoose');
const userSchema=mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true,
    },
    email: {
        type: String,
        unique: true,
        required: true,
      },
      password: {
        type: String,
        required: true,
      },
      token: { type: String },
      lastLogout: { type: Date },
      createdStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
      likedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }],
      savedStories:[{ type: mongoose.Schema.Types.ObjectId, ref: 'Story' }]
},
{
  timestamps: true,
},



);

const User = mongoose.model('User', userSchema);
module.exports = User;