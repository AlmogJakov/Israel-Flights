const express = require('express');
const app = express();
var server = require('http').createServer(app)
const io = require("socket.io")(server, {
    allowEIO3: true // false by default
});
const kafka = require('./models/comsumeKafka');
const redis = require("./models/redisDB");
const controllerRouter = require('./routes/controller'); //controller
const path = require('path');

//--------------Middleware------------------
//app.set("views", join(__dirname, "views"));
app.set('view engine', 'ejs');
//app.set('views', './views');
app.set("views", path.join(__dirname, "views"));
app.use(express.json());

//**Init values in redis in 24:00 */
redis.setExpiresTime();

//-------------Socket.io-------------------------
io.on("connection", async (socket) => {
    //Get data from redis to dashboard
    let allDataArray = await redis.getAllData();
    //console.log(allDataArray);
    let getAverageTime = await redis.getAverageTime();
    
    //Move to dashboard - number of calls by topics & number of waiting & number of calls by cities
    io.emit('allData', 
    {join: allDataArray[0],service: allDataArray[1], complaint: allDataArray[2] , 
        leave: allDataArray[3], waiting: allDataArray[4], averageTotalTime: getAverageTime,
        Jerusalem:allDataArray[5] ,Nahariya:allDataArray[6] ,Haifa:allDataArray[7] 
        ,Tel_Aviv:allDataArray[8] ,Ashdod:allDataArray[9] ,Ashkelon: allDataArray[10],Beer_Sheva: allDataArray[11]});

    //Reset Info Manualiy
    socket.on('resetDB', function () {
        // reset redis
        redis.initDB(); 
    });

});


// ------------Consumer from Kafka-----------------
kafka.consumer.on("data", async (msg) => {
    const newCall = JSON.parse(msg.value);
    //console.log(newCall);
    // **Store the data in Redis and after send to Dashboard */
    if(String(msg.value).length < 100) //Total wating calls
    {
        redis.setTopic('TotalWaiting',parseInt(msg.value));
    }
    else if(String(msg.value).includes("topic")) // Details calls
    {   

        io.emit("New_Call",
        {firstname: newCall.firstName, lastname: newCall.lastName, phone: newCall.phone
            , topic: newCall.topic, totaltime: newCall.totalTime});

        redis.setTopic(newCall.topic,0);
        redis.setCity(newCall.city);
        redis.setAverageTime(newCall.totalTime);
    }

    //Get data from redis to dashboard
    let allDataArray = await redis.getAllData();
    let getAverageTime = await redis.getAverageTime();
    
    //Send to front with socket
    io.emit('allData', 
    {join: allDataArray[0],service: allDataArray[1], complaint: allDataArray[2] ,
         leave: allDataArray[3], waiting: allDataArray[4], averageTotalTime: getAverageTime});
});


//----------------Front Side - Daily Call Center ------------------

app.use('/', controllerRouter);

//------------------------------------------------

const Port = process.env.PORT || 3001;
//http://localhost:3001
server.listen(Port, () => console.log(`Server B is listening at http://localhost:${Port}`));
