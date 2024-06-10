require('dotenv').config();
const express = require('express'),
app = express(),
db=require('./db'),
cors = require('cors'),

port=process.env.PORT;

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

db.on('error',(err)=>console.error(err));
db.once('open',()=>console.log('connected'))



const listener = app.listen(port, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
