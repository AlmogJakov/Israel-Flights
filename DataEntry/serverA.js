const express = require('express');
const app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server, {
    allowEIO3: true // false by default
});
const kafka = require("./models/produceKafka");
const controllerRouter = require('./routes/controller'); //controller


const bodyParser = require('body-parser');
const path = require('path');

//----------------- Middleware -----------------
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "views"));
app.use(express.static('./views/Calls_Table_Responsive'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//----------------Front side ------------------
app.use('/', controllerRouter);

// --- Socket.io - Produce call details to kafka ----------------
io.on("connection", (socket) => {
    console.log("new user connected");
    socket.on("totalWaitingCalls", (msg) => { kafka.publish(msg) });
    socket.on("callDetails", (msg) => { kafka.publish(msg) });
});

// v1 = express.Router();
// app.use('/api/v1', v1)
// const summoner = require('./models/flights');
// v1.get('/summoner', summoner.accoutDetails)

const Port = process.env.PORT | 3000;
//http://localhost:3000
server.listen(Port, () => console.log(`Call Generator app listening at http://localhost:${Port}`));


