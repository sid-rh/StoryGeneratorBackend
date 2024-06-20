const jwt=require("jsonwebtoken");
const User=require('../models/user');
const dotenv=require('dotenv');

dotenv.config();

const attachUser=async(req,res,next)=>{
    try {
        
        const userRecord = await User.findById(req.currentUserId);
        if (!userRecord) {
          res.status(401).send('User Not Found');
        }
        const currentUser = userRecord.toObject();
        Reflect.deleteProperty(currentUser, 'password');
        Reflect.deleteProperty(currentUser, 'salt');
        Reflect.deleteProperty(currentUser, 'token');
        req.currentUser = currentUser;
        return next();
      } catch (e) {
        return next(e);
      }
}

module.exports=attachUser;