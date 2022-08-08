const express = require("express");
const axios = require("axios");
const router = express.Router();
var mysql = require("../models/mysql");

// auto format code: https://blog.yogeshchavan.dev/automatically-format-code-on-file-save-in-visual-studio-code-using-prettier

// router.get('/', (req, res) => { //(URL || Path , Call back function)
// Call Generator of users from MySQL
//    db.query("SELECT * FROM users;", function (err, result, fields) {
//        if (err) throw err;
//         res.render('Calls_Table_Responsive/index' ,{data: result})
//     });
// })
// module.exports = router;

function iterateFlights(database) {
  var result = {};
  var keys = Object.keys(database);
  const json = JSON.parse(JSON.stringify(database));
  for (var i = 2; i < keys.length - 1; i++) {
    var filghtID = keys[i];
    var onGround = json[filghtID][14];
    if (
      (onGround == "0" && json[filghtID][12] == "TLV") ||
      json[filghtID][11] == "TLV"
    ) {
      result[filghtID] = [];
      var coordinateX = json[filghtID][1];
      var coordinateY = json[filghtID][2];
      var degree = json[filghtID][3];
      var time = json[filghtID][10];
      var src = json[filghtID][11];
      var dst = json[filghtID][12];

      var data = {
        id: filghtID,
        on_ground: onGround,
        coordinate_x: coordinateX,
        coordinate_y: coordinateY,
        degree: degree,
        time: time,
        source: src,
        destination: dst,
      };
      result[filghtID].push(data);
    }
  }
  return result;
}

// ----------------- Produce flights -----------------
const kafka = require("../models/produceKafka");
// async function that writes a new message each second: https://www.sohamkamani.com/nodejs/working-with-kafka/
const produce = async () => {
  //await kafka.connect()
  let i = 0;
  // after the produce has connected, we start an interval timer
  setInterval(async () => {
    try {
      await axios
        .get(
          "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
        )
        .then(function (response) {
          // handle success
          mysql.access_writing("flightradar24");
          data = response.data;
          //kafka.publish(JSON.stringify(iterateFlights(data)));
        })
        .catch(function (error) {
          // handle error
          console.log(error);
        })
        .then(function () {
          // always executed
        });
      console.log("writes: ", i);
      i++;
    } catch (err) {
      console.error("could not write message " + err);
    }
  }, 5000);
};
produce();

// ----------------- Client -----------------
// Return current flight details to client
const flights = require("../models/flights");
router.get("/", flights.flightsDetails);
module.exports = router;
