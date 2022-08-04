const connect = require("./connect"); //Connect to MongoDB Compass
const mongoose = require('mongoose');

const callDetailsSchema = new mongoose.Schema({
  id: String,
  firstName: String,
  lastName: String,
  phone: String,
  city: String,
  gender: String,
  age: Number,
  prevCalls: Number,
  totalTime: Number,
  product: String,
  period: String,
  topic: String,
},
{versionKey: false});

const callDetails = mongoose.model('callDetails', callDetailsSchema);

module.exports = callDetails;