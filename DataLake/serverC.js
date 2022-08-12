const express = require("express");
const app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
});
var fs = require("fs");
//const BigML = require('./models/bml');
const mongodb = require("./models/MongoDB/mongodb");
const kafka = require("./models/consumeKafka");

const controllerRouter = require("./routes/controller"); //controller

//--------------Middleware------------------

app.set("view engine", "ejs");
app.use(express.static("./views/Prediction_Table_Responsive"));
app.use(express.json());

//------------Consumer from Kafka-----------------

// get data from kafka to store (and predict later)
kafka.consumer.on("data", (msg) => {
  // Parse the input data (flights) to json
  mongodb.saveFlightsDetails(JSON.parse(msg.value));
  // mongodb.export2csv();
});

//----------------Front side ------------------
app.use("/", controllerRouter);

// get data from client to create model
// //-------- Socket.io ---------------- for bigML
// io.on("connection", (socket) => {
//   socket.on("Train", async (msg) => {
//     var res = await BigML.createModel();
//     setTimeout(function () {
//       socket.emit("Model", res);
//     }, 10000);
//   });

//   socket.on("Predict", async (msg) => {
//     await BigML.predict(newcall);
//     setTimeout(function () {
//       fs.readFile("predict.txt", "utf8", function (err, data) {
//         socket.emit("Prediction", data);
//       });
//     }, 2000);
//   });
// });

const Port = process.env.PORT || 3002;
//http://localhost:3002
server.listen(Port, () => console.log(`BigML app listening at http://localhost:${Port}`));
