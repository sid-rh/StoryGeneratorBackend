const jwt=require("jsonwebtoken");
const User=require('../models/user');
const dotenv=require('dotenv');

dotenv.config();

// const auth=async(req,res,next)=>
// {
//     try {
//         if (
//             (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Token') ||
//             (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer')
//           ) {
//             const token=req.headers.authorization.split(" ")[1];
//             const user = jwt.verify(token,process.env.JWT_SECRET);
//             req.currentUserId=user._id;
            
//           } else {
//             return res.status(401).send({message:"Unauthorized"});
//           }

//           return next();
//     } catch (error) {
//         console.log(error);
//         return res.status(401).send({message:"Unauthorized"});
//     }
// }
const auth=async(req,res,next)=>{
  let token;
  token=req.cookies.jwt;

  if(token)
  {
    try {
      const decoded=jwt.verify(token,process.env.JWT_SECRET);
      req.currentUser=await User.findById(decoded._id).select('-password');
      next();
    } catch (error) {
      return res.status(401).send('Unauthorized, invalid token');
    }

  }
  else
  {
    return res.status(401).send({error:"Unauthorized, no token"})
  }
}

module.exports=auth;