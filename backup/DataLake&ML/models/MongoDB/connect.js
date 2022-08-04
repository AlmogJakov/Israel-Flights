const mongoose = require('mongoose');
mongoose.connect('mongodb+srv://lior:054132857@cluster0.r72xf.mongodb.net/BigData');

const db = mongoose.connection;
db.on('error', console.error.bind(console,'connection error: '));
db.once('open', () => {
    console.log("MongoDB Connected")
});

module.exports = db;