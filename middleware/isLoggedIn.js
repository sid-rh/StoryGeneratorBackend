const jwt=require("jsonwebtoken");
const User=require('../models/user');
const dotenv=require('dotenv');

dotenv.config();

const isLoggedIn=async(req,res,next)=>
{
    try {
        if (
            (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
            (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
          ) {
            const userRecord = await User.findOne({
              _id: req.currentUserId,
              token: req.headers.authorization.split(' ')[1],
            });
            if (!userRecord) res.status(401).send({message:"Unauthorized"})
          } else {
            res.status(401).send({message:"Unauthorized"})
          }
          return next();
        
    } catch (error) {
        console.log(error);
        res.status(401).send({message:"Unauthorized"});
    }
}

module.exports=isLoggedIn;