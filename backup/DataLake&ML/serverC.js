const express = require('express');
const app = express();
var server = require('http').createServer(app);
const io = require("socket.io")(server, {
    allowEIO3: true // false by default
});
var fs = require("fs");
const BigML = require('./models/bml');
const mongodb = require('./models/MongoDB/mongodb');
const kafka = require("./models/comsumeKafka");

const controllerRouter = require('./routes/controller'); //controller

//--------------Middleware------------------

app.set('view engine', 'ejs');
app.use(express.static('./views/Prediction_Table_Responsive'));
app.use(express.json());

//------------Consumer from Kafka-----------------

var newcall = "Waiting for new call...";

io.on("connection", (socket) => {
    kafka.consumer.on("data", (msg) => {
        if(String(msg.value).includes("topic")){ //Data for MongoDB
            
            mongodb.saveDetailCall(msg);

        }
        else if(String(msg.value).length > 100){ //Data for predict in BigML
            const newCall = JSON.parse(msg.value);
            socket.emit("NewCall", 
            {firstname: newCall.firstName, lastname: newCall.lastName, phone: newCall.phone, city: newCall.city, gender: newCall.gender, age: newCall.age, prevcalls: newCall.prevCalls});
            newcall = msg.value;
        }

    });
});

//----------------Front side ------------------
app.use('/', controllerRouter);

//-------- Socket.io ----------------
io.on("connection", (socket) => {

    socket.on("Train", async (msg) => {  
        var res = await BigML.createModel();
        setTimeout(function(){
            socket.emit("Model", res);
        }, 10000);
    });

    socket.on('Predict', async (msg) => 
        {await BigML.predict(newcall);
        setTimeout(function(){
            fs.readFile('predict.txt', 'utf8', function(err, data){
                socket.emit("Prediction", data);
            });
        }, 2000);
    });

});

const Port = process.env.PORT || 3002;
//http://localhost:3002
server.listen(Port, () => console.log(`BigML app listening at http://localhost:${Port}`));