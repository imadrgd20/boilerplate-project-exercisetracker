require('dotenv').config();
const mongoose=require('mongoose'),
mongoUri=process.env.URI;

mongoose.connect(mongoUri,{useNewUrlParser: true,useUnifiedTopology: true,});
const db=mongoose.connection();
module.exports=db;