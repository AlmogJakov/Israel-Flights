const express = require("express");
const app = express();
var server = require("http").createServer(app);
const io = require("socket.io")(server, {
  allowEIO3: true, // false by default
});
const kafka = require("./models/consumeKafka");
const kafkaML = require("./models/consumeKafkaML");
const redis = require("./models/redisDB");
const controllerRouter = require("./routes/controller"); //controller
const path = require("path");

//--------------Middleware------------------
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
//app.set('views', './views');
app.use(express.json());

//-------------Socket.io-------------------------
io.on("connection", async (socket) => {
  // Get redis flights (in case there is no record - an empty array is returned)
  let redisFlights = await redis.getData("flights");
  // Update the dashboard directly with the returned flights data
  io.emit("flights", redisFlights);
  //
  let redisLearningResult = await redis.getData("learningResult");
  //
  io.emit("learningResult", redisLearningResult);
});

// ------------Consumer from Kafka-----------------
kafka.consumer.on("data", async (msg) => {
  // Parse the input data (flights) to json
  const flights = JSON.parse(msg.value);
  // Update the dashboard directly with the flights data
  io.emit("flights", flights);
  // Store the current flights details with expire time (TTL) = 30 seconds
  // (In a real-time system, the data becomes irrelevant after a certain time)
  redis.setData(flights, "flights", 30);
});

kafkaML.consumer.on("data", async (msg) => {
  //const flights = JSON.parse(msg.value);
  const learningResult = JSON.parse(msg.value);
  // Store the current learning result with expire time (TTL) = 30 seconds
  // (In a real-time system, the data becomes irrelevant after a certain time)
  redis.setData(learningResult, "learningResult", 30);
  // console.log(learningResult);
  io.emit("learningResult", learningResult);
});

//----------------Front Side - Daily Call Center ------------------

app.use("/", controllerRouter);

//------------------------------------------------

const Port = process.env.PORT || 3001;
//http://localhost:3001
server.listen(Port, () => console.log(`App listening at http://localhost:${Port}`));
