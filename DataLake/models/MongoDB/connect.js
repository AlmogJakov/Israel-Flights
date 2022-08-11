const mongoose = require("mongoose");
//mongoose.connect("mongodb+srv://lior:054132857@cluster0.r72xf.mongodb.net/BigData");
const dbURL = "mongodb+srv://almogjakov:pass123456@bigdata.1ra6s44.mongodb.net/big-data?retryWrites=true&w=majority";
// Source: https://www.youtube.com/watch?v=bxsemcrY4gQ
// Source: https://stackoverflow.com/questions/60563988/unhandledpromiserejectionwarning-mongooseserverselectionerror
mongoose
  .connect(dbURL, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB Connected!"))
  .catch((err) => console.log(err));
//mongoose.connect(dbURL);
// mongodb+srv://almogjakov:pass123456@bigdata.1ra6s44.mongodb.net/?retryWrites=true&w=majority
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
// db.once("open", () => {
//   console.log("MongoDB Connected!");
// });

module.exports = db;
