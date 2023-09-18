const express = require('express');
const app = express();
require('dotenv').config();
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser')
const userAuthRoute = require('./routes/userAuth');
const taskRoute = require('./routes/task');
//Handles incoming json data
app.use(express.json());
app.use(cookieParser());


//Handles incoming urlencoded data
app.use(express.urlencoded({ extended: true }));

main().catch((err) => console.log(err));
async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/userAuth');
  console.log('**DATABASE CONNECTED**');
}

app.use('/', userAuthRoute)
app.use('/', taskRoute)

app.use((err,req,res,next)=>{
  const status = err.status || 500;
  const message = err.message || "Error occured";
  res.status(status).json({message})
})
app.listen(4000, () => {
  console.log('Listening on port 4000');
});
