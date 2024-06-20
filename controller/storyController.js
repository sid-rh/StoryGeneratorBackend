const mongoose=require('mongoose');
const User=require('../models/user');
const Like=require('../models/likes');
const bcrypt=require('bcrypt');
const dotenv=require('dotenv');
const jwt=require('jsonwebtoken');
const Story=require('../models/story');
const openai=require('../openai/config');

dotenv.config();

const generateStory=async(req,res)=>{
    try {
        const prompt=req.body.prompt;
        
        const response=await openai.chat.completions.create({
            model:'gpt-3.5-turbo',
            messages:[
                {
                    role: "system",
                    content: "You are a helpful assistant that generates short stories.",
                  },
                  {
                    role: "user",
                    content: `Generate a short story of 50 words which starts with: "${prompt}", 
                            return the title at the end of the story, ensure that the title is separated by "Title:"`,
                  },

            ],
           
            max_tokens:150,
            top_p:1,
            temperature:0.5,
            frequency_penalty:0,
            presence_penalty:0,
        });
        const separator = "Title:";
        const story = response.choices[0].message.content;
        console.log(story);

        const parts = story.split(separator);

        if (parts.length === 2) {
            const content = parts[0].trim();
            const title = parts[1].trim();
      
            return res.status(200).json({ message: "Working", title, content });
          } else {
            // If the separator is not found, you can handle it accordingly
            return res
              .status(400)
              .json({ error: "Separator not found in generated story" });
          }
        
    } catch (error) {
        console.log(error);
        return res.status(400).json({error:error});
    }
}

const createStory=async(req,res)=>{
    try {
        const { title, content } = req.body;
        const createdById = req.currentUser._id; // Get the user's ID from authentication
    
        // Create a new story
        const story = new Story({ title, content, createdBy:{_user:createdById} });
        await story.save();

        await User.findByIdAndUpdate(createdById,{$push:{createdStories:story._id}});
    
        res.status(201).send({message:"Story created",story:story});
      } catch (error) {
        console.error('Error creating story:', error);
        return res.status(500).send({ error: 'Internal Server Error' });
      }
}

const updateStory=async(req,res)=>
{
    try {
        const storyId=req.body.id;
        const currentUserId=req.currentUser._id;
        let payload={
            ...req.body,
            editedAt:new Date(),
        }
        
        const story=await Story.findOne({_id:storyId});
        // console.log(story);
        // console.log(currentUserId);
        if(!story) 
        {
            res.status(400).send({error:'Story does not exist'});
        }
        else if(!story.createdBy._user.equals(currentUserId))
        {
            res.status(400).send({error:'Story does not exist'});

        }
        else
        {
            const updatedStory=await Story.updateOne({_id:storyId},payload);
            res.status(201).send(updatedStory);
        }

        

        
    } catch (error) {
        console.error('Error editing story:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

const getAllStories=async(req,res)=>
{
    const page = parseInt(req.body.page) || 1; 
    const perPage = parseInt(req.body.perPage) || 5;
    const skip = (page - 1) * perPage;
    try {
        const stories = await Story.aggregate([
            {
              $addFields: {
                likesCount: { $size: '$likes' }, // Calculate the number of likes
              },
            },
            {
                $sort:{
                    'likesCount':-1
                }
            },

            {
                $lookup: {
                  from: 'users', // The name of the User collection
                  localField: 'createdBy._user',
                  foreignField: '_id',
                  as: 'createdBy.user', // The name of the field to populate with the user document
                },
              },

              {
                $addFields: {
                  'createdBy.user': { $arrayElemAt: ['$createdBy.user.username', 0] }, // Extract the username field
                },
              },

            {
                $facet: {
                  paginatedresult: [{ $skip: skip }, { $limit: perPage }],
                  totalcount: [{ $count: 'count' }],
                },
              },
          ]);
      
          
        res.status(201).send(stories);
        
    } catch (error) {
        console.error('Error getting story:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
    
}

const getLikedStories=async(req,res)=>
{
    const userId=req.currentUser._id;
    try {
    //     const user = await User.findById(userId).populate('likedStories');
    // if (!user) {
    //   return res.status(404).json({ error: 'User not found' });
    // }
    // const likedStories = user.likedStories;

    const likedStories = await Story.aggregate([
        
        {
          $match: {
            likes: { $in: [new mongoose.Types.ObjectId(userId)] }, // Find stories liked by the user
          },
        },
        {
            $addFields: {
              likesCount: { $size: '$likes' }, // Calculate the likesCount
            },
          },
      ]);

    res.status(200).json(likedStories);
    } catch (error) {
        console.error('Error getting liked stories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

const getSingleStory=async(req,res)=>
{
    try {
        // const story=await Story.findOne({_id:req.body.id});
        const story = await Story.aggregate([
            {
              $match: {
                '_id':  new mongoose.Types.ObjectId(req.body.id),
              },
            },
            {
                $lookup: {
                  from: 'users', // The name of the User collection
                  localField: 'createdBy._user',
                  foreignField: '_id',
                  as: 'createdBy.user', // The name of the field to populate with the user document
                },
              },

            {
              $addFields: {
                likesCount: { $size: '$likes' }, 
                'createdBy.user': { $arrayElemAt: ['$createdBy.user.username', 0] },
              },
            },
            
          ]);
        if(!story) res.status(400).send({error:'Story does not exist'});

        res.status(201).send(story);
        
    } catch (error) {
        console.error('Error getting story:', error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

const getStoryByUser=async(req,res)=>
{
    const userId=req.body.id;
    const page = parseInt(req.body.page) || 1; 
    const perPage = parseInt(req.body.perPage) || 5;
    const skip = (page - 1) * perPage;
    try {
        const stories = await Story.aggregate([
            {
              $match: {
                'createdBy._user': new mongoose.Types.ObjectId(req.body.id),
              },
            },
            {
              $addFields: {
                likesCount: { $size: '$likes' }, 
              },
            },
            {
                $sort:{
                    'likesCount':-1
                }
            },

            {
                $lookup: {
                  from: 'users', // The name of the User collection
                  localField: 'createdBy._user',
                  foreignField: '_id',
                  as: 'createdBy.user', // The name of the field to populate with the user document
                },
              },

              {
                $addFields: {
                  'createdBy.user': { $arrayElemAt: ['$createdBy.user.username', 0] }, // Extract the username field
                },
              },
            {
                $facet: {
                  paginatedresult: [{ $skip: skip }, { $limit: perPage }],
                  totalcount: [{ $count: 'count' }],
                },
              },
          ]);
        res.status(201).send(stories);
    } catch (error) {
        console.error('Error getting stories',error);
        res.status(500).send({error:'Internal server error'});
    }
}

const deleteStory=async(req,res)=>
{
    try {
        const storyId = req.body.id;
        const userId = req.user._id; // Get the authenticated user's ID
    
        // Check if the story exists and if the user is the creator of the story
        const story = await Story.findOne({ _id: storyId });
    
        if (!story) {
          return res.status(404).send({ error: 'Story not found' });
        }
        if(!userId.equals(story.createdBy._user))
        {
            return res.status(404).send({error:'Unauthorized to delete'});
        }
    
        await story.remove();
    
        res.status(200).send({ message: 'Story deleted successfully' });
      } catch (error) {
        console.error('Error deleting story:', error);
        res.status(500).send({ error: 'Internal Server Error' });
      }
}

const likeStory=async(req,res)=>
{
    try {
        const storyId = req.body.id;
        const userId = req.currentUser._id; // Get the authenticated user's ID
    
        // Check if the user has already liked the story
        const existingLike = await Like.findOne({ user: userId, story: storyId });
    
        if (existingLike) {
          return res.status(400).json({ error: 'User already liked this story' });
        }
    
        // Create a new like
        const like = new Like({ user: userId, story: storyId });
        await like.save();
    
        // Add the like to the story's likes array
        await Story.findByIdAndUpdate(storyId, { $push: { likes: userId } });
        await User.findByIdAndUpdate(userId,{$push:{likedStories:storyId}});
    
        res.status(200).json({ message: 'Story liked successfully' });
      } catch (error) {
        console.error('Error liking story:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const unlikeStory=async(req,res)=>
{
    try {
        const storyId = req.body.id;
        const userId = req.currentUser._id;

        await Like.findOneAndDelete({ user: userId, story: storyId });

    // Remove the like from the story's likes array
    await Story.findByIdAndUpdate(storyId, { $pull: { likes: userId } });
    await User.findByIdAndUpdate(userId,{$pull:{likedStories:storyId}});

    res.status(200).json({ message: 'Story unliked successfully' });
        
    } catch (error) {
        console.error('Error unliking the story: ',error);
        res.status(500).json({error:'Internal Server Error'});
    }
}

const saveStory=async(req,res)=>
{
    try {
        const storyId = req.body.id;
        const userId = req.currentUser._id; // Get the authenticated user's ID
    
        // Check if the user has already liked the story
        const user = await User.findById(userId);

        if (!user) {
        return res.status(404).json({ error: 'User not found' });
        }
    
        
    
        user.savedStories = user.savedStories || [];

    // Check if the story's ID is not already in the user's 'savedPosts' array
    if (!user.savedStories.includes(storyId)) {
      // Add the post ID to the user's 'savedPosts' array
      await Story.findByIdAndUpdate(storyId, { $push: { saves: userId } });
        await User.findByIdAndUpdate(userId,{$push:{savedStories:storyId}});
      res.status(200).json({ message: 'Story saved successfully' });
    } else {
      // The story is already saved by the user
      res.status(400).json({ message: 'Story is already saved' });
    }
      } catch (error) {
        console.error('Error Saving story:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const unsaveStory=async(req,res)=>{
    try {
        const storyId = req.body.id;
        const userId = req.currentUser._id; 

        const user = await User.findById(userId);

        if (!user) {
        return res.status(404).json({ error: 'User not found' });
        }
    
        
    
        user.savedStories = user.savedStories || [];

    
    if (user.savedStories.includes(storyId)) {
      // Add the post ID to the user's 'savedPosts' array
      await Story.findByIdAndUpdate(storyId, { $pull: { saves: userId } });
        await User.findByIdAndUpdate(userId,{$pull:{savedStories:storyId}});
      res.status(200).json({ message: 'Story unsaved successfully' });
    } else {
      // The story is already saved by the user
      res.status(400).json({ message: 'Story is not saved' });
    }
      } catch (error) {
        console.error('Error unsaving story:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
}

const getSavedStories=async(req,res)=>
{
    const userId=req.currentUser._id;
    const page = parseInt(req.body.page) || 1; 
    const perPage = parseInt(req.body.perPage) || 5;
    const skip = (page - 1) * perPage;
    try {
    const savedStories = await Story.aggregate([ 
        {
          $match: {
            
            saves: { 
                $exists: true,
                $in: [new mongoose.Types.ObjectId(userId)] }, // Find stories liked by the user
          },
        },
        {
            $addFields: {
              likesCount: { $size: '$likes' }, // Calculate the likesCount
            },
        },

        {
            $sort:{
                'likesCount':-1
            }
        },

        {
            $lookup: {
              from: 'users', // The name of the User collection
              localField: 'createdBy._user',
              foreignField: '_id',
              as: 'createdBy.user', // The name of the field to populate with the user document
            },
          },

          {
            $addFields: {
              'createdBy.user': { $arrayElemAt: ['$createdBy.user.username', 0] }, // Extract the username field
            },
          },
        {
            $facet: {
              paginatedresult: [{ $skip: skip }, { $limit: perPage }],
              totalcount: [{ $count: 'count' }],
            },
          },
      ]);
    res.status(200).json(savedStories);
    } catch (error) {
        console.error('Error getting saved stories:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


module.exports={createStory,
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
            };