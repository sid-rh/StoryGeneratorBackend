const express=require('express');
const router=express.Router();

const auth=require('../middleware/auth');
const isLoggedIn=require('../middleware/isLoggedIn');
const attachUser=require('../middleware/attachUser');

const {createStory,
    updateStory,
    getAllStories,
    getSingleStory,
    getStoryByUser,
    deleteStory,
    likeStory,
    unlikeStory,
    generateStory,
    getLikedStories,
    saveStory,
    unsaveStory,
    getSavedStories,
    }=require('../controller/storyController');

router.post('/create',
    auth,
    // isLoggedIn,
    // attachUser,
    createStory);
router.post('/update',
    auth,
    // isLoggedIn,
    // attachUser,
    updateStory);
router.post('/getAll',getAllStories);
router.post('/getSingle',getSingleStory);
router.post('/getByUser',getStoryByUser);
router.post('/delete',
    auth,
    // isLoggedIn,
    // attachUser,
    deleteStory);
router.post('/like',
    auth,
    // isLoggedIn,
    // attachUser,
    likeStory);
router.post('/unlike',
    auth,
    // isLoggedIn,
    // attachUser,
    unlikeStory);
router.post('/generate',
    auth,
    // isLoggedIn,
    // attachUser,
    generateStory);

router.post('/getLiked',
    auth,
    getLikedStories);

router.post('/save',
    auth,
    saveStory);

router.post('/unsave',
    auth,
    unsaveStory);

router.post('/getSaved',
    auth,
    getSavedStories);


module.exports = router;