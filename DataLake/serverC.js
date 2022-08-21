const express = require("express");
const app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
});
const BigML = require("./models/bml");
const mongodb = require("./models/MongoDB/mongodb");
const bigML = require("./models/bml");
const kafka = require("./models/consumeKafka");
var kafkaML = require("./models/produceKafkaML");
const controllerRouter = require("./routes/controller"); //controller

//--------------Middleware------------------

app.set("view engine", "ejs");
app.use(express.static("./views/Prediction_Table_Responsive"));
app.use(express.json());

//------------Consumer from Kafka-----------------

// Get the data from kafka & store in mongoDB (to predict later)
kafka.consumer.on("data", async (msg) => {
  mongodb.saveFlightsDetails(JSON.parse(msg.value));
  var result = await bigML.predictAll(JSON.parse(msg.value));
  kafkaML.publish(result);
});

//----------------Front side ------------------
app.use("/", controllerRouter);

io.on("connection", (socket) => {
  // Build a model from the dates obtained in the client side
  socket.on("dateRange", async (msg) => {
    var recordsFound = await BigML.createModel(msg);
    socket.emit("recordsFound", recordsFound);
  });
});

const Port = process.env.PORT || 3002;
// Server Link: http://localhost:3002
server.listen(Port, () => console.log(`BigML app listening at http://localhost:${Port}`));
