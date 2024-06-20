const express=require('express');
const router=express.Router();

const auth=require('../middleware/auth');
const isLoggedIn=require('../middleware/isLoggedIn');
const attachUser=require('../middleware/attachUser');
const {validateRegistration}=require('../middleware/authValidation');
const {register,login,getAllUsers,getUser,deleteUser,logout} = require('../controller/userController');

// Route for user registration
router.post('/register',validateRegistration, register);
router.post('/login',login);
router.post('/getAllUsers',getAllUsers);
router.post('/getUser',getUser);
router.post('/deleteUser',deleteUser);
router.post(
    '/logout',
    auth,
    // isLoggedIn,
    // attachUser,
    logout);


module.exports = router;