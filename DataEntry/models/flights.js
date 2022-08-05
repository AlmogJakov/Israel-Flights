var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

var data = {};

// // Make a request for a user with a given ID
// axios.get('https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1')
//   .then(function (response) {
//     // handle success
//     data = response.data
//     //console.log(response);
//   })
//   .catch(function (error) {
//     // handle error
//     console.log(error);
//   })
//   .then(function () {
//     // always executed
//   });

function iterateFlights(database) {
  var result = {};
  var keys = Object.keys(database);
  //var json = JSON.parse(data)
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
      //console.log(JSON.stringify(result));

      //console.log(onGround);
      //alert(i)
      //break;
    }
  }
  return result;
}

const flightsDetails = (req, res) => {
  axios
    .get(
      "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
    )
    .then(function (response) {
      // handle success
      data = response.data;
      data = iterateFlights(data);
      return res.status(200).json(data);
      //console.log(response);
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    })
    .then(function () {
      // always executed
    });
};

// router.get('/', function(req, res, next) {
//   res.render('index', {title: 'Express'});
// });

module.exports = {
  flightsDetails,
};

// const accoutDetails = (req,res) => {
//   let data = {test: "Test"}
//   return res.status(200).json(data)
// }

// module.exports = {
//   accoutDetails
// }

// ------------------------

// const axiosOptions = {
//   headers: {
//     "X-Riot-Token": process.env.RIOTKEY,
//   },
// };

// const getSummonerByName = async (region,summonerName) => {
//     const res = await axios.get(config.summonerByNameUrl(region, summonerName), axiosOptions);
//     return res.data;
// }

// const summonerParser = async (req,res) => {
//     if(!req.query.summonerName || !req.query.region){
//         return res.status(403).json({error: "Missing summoner name or region."});
//     }
//     const summonerData = await getSummonerByName(req.query.region, req.query.summonerName);
//     return res.status(200).json(summonerData);

// }

// module.exports = {
//     summonerParser
// }
