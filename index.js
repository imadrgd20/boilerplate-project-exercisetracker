require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const port = process.env.PORT || 3000; // Fallback to 3000 if PORT is not set
const URI = process.env.URI || 'mongodb+srv://reguadiimad20:Macbook2020@cluster0.bvmpjom.mongodb.net/';

app.use(cors());
app.use(express.static('public'));
app.use(express.json()); // To parse JSON bodies
app.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

// DataBase connection-------------------
mongoose.connect(URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Listen for successful connection
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to the database');
});

// Listen for connection errors
mongoose.connection.on('error', (err) => {
  console.log('Mongoose connection error:', err);
});

// The Schemas---------------------------
const userSchema = new mongoose.Schema({ username: String });
const User = mongoose.model('User', userSchema);

const exerciseSchema = new mongoose.Schema({
  username: String,
  description: String,
  duration: Number,
  date:{ type: Date, default: Date.now }
});
const Exercise = mongoose.model('Exercise', exerciseSchema);

// EndPoints----------------------------
// ------UsersEndPonins-----------------
app.post('/api/users', async (req, res) => {
  try {
    const { username } = req.body;
    if(!username)return res.json({ error: 'Username is required'});
    const user = await User.create({ username }),
    showedUser=await User.findById(user._id).select('-__v');
    res.json(showedUser);
  } catch (err) {
    console.error(err);
  }
})
app.get('/api/users',async(req,res)=>{
  try{
    const users=await User.find({});
    res.json(users);
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
})
// ------ExerciceEndPonins--------------
app.post('/api/users/:_id/exercises', async (req, res) => {
  try {
    const {_id}=req.params;
    const {description,duration,date}=req.body;
    const user=await User.findById(_id).select('username');
    const username=user.username;
    const passedDate = date ? new Date(date) : new Date();
    const showedDate = passedDate.toDateString();

    if(!username)return res.json('User not found');
    if(!description||!duration)return res.status(400).json({ error: 'Description and duration are required' });

    const exercise= await Exercise.create({
      username:username,
      description: description,
      duration: duration,
      date:passedDate
    })
    res.json({ _id: user._id, username: username, date: showedDate, duration: exercise.duration, description: exercise.description });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 'error':err });
  }
});

//.     /api/users/666b15189a57422957c68575/logs

app.get('/api/users/:_id/logs', async (req, res) => {
  try {
    const { _id } = req.params;
    const user = await User.findById(_id).select('username');
    const { from, to, limit } = req.query;
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const username = user.username;
    
    let query = { username };
    
    if (from && to) {
      query.date = { $gte: new Date(from), $lte: new Date(to) };
    } else if (from) {
      query.date = { $gte: new Date(from) };
    } else if (to) {
      query.date = { $lte: new Date(to) };
    }
    
    let exercisesQuery = Exercise.find(query);
    
    if (limit) {
      exercisesQuery = exercisesQuery.limit(parseInt(limit));
    }
    
    const exercises = await exercisesQuery.exec();
    
    const log = exercises.map(exercise => ({
      description: exercise.description,
      duration: exercise.duration,
      date: exercise.date.toDateString()
    }));
    
    const response = {
      _id: _id,
      username: username,
      count: exercises.length,
      log: log
    };
    
    res.json(response);
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});


// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Start the server
const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
