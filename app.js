const express=require('express');
const bodyParser=require('body-parser');
const cors=require('cors');
const mongoose=require('mongoose');
const dotenv=require('dotenv');
const cookieParser=require('cookie-parser');
const userRoutes=require('./routes/userRoutes');
const storyRoutes=require('./routes/storyRoutes');

const app=express();
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.json());
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
    .then(
        ()=>{
            console.log("Connected to db");
        }
    );

app.use('/user',userRoutes);
app.use('/story',storyRoutes);


    app.listen(8000,()=>
    {
        console.log('listening');
    });