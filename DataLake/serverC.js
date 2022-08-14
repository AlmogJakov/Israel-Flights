const express = require("express");
const app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
});
var fs = require("fs");
const BigML = require("./models/bml");
const mongodb = require("./models/MongoDB/mongodb");
const bigML = require("./models/bml");
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
  bigML.predictAll(JSON.parse(msg.value));
  //mongodb.export2csv();
  //bigML.createModel();
  // console.log(keys);
  // console.log(JSON.stringify(JSON.parse(msg.value)[keys[0]]));

  // var json = JSON.parse(JSON.parse(msg.value));
  // var keys = Object.keys(json);
  // key = keys[0];
  // keys.forEach(function (key) {
  //   f = {
  //     flightID: key,
  //     periodType: json[key][0]["extended_info"]["period_type"],
  //     month: json[key][0]["extended_info"]["month"],
  //     day: json[key][0]["extended_info"]["day"],
  //     company: json[key][0]["extended_info"]["company"],
  //     srcCountry: json[key][0]["extended_info"]["src_country"],
  //     dstCountry: json[key][0]["extended_info"]["dst_country"],
  //     flightDurationType: json[key][0]["extended_info"]["flight_duration_type"],
  //     srcCountryWeather: json[key][0]["extended_info"]["src_country_weather"],
  //     dstCountryWeather: json[key][0]["extended_info"]["dst_country_weather"],
  //     arrivalTimeType: 0,
  //   };
  //   // console.log(f);
  //   bigML.predict(f);
  // });
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

io.on("connection", (socket) => {
  // Build a model from the dates obtained
  socket.on("dateRange", async (msg) => {
    // Return num of records used to build the model
    // TODO: on error, return an error message to the client
    var recordsFound = await BigML.createModel(msg);
    socket.emit("recordsFound", recordsFound);
    // setTimeout(function () {
    //   socket.emit("Model", res);
    // }, 10000);
  });
});

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
