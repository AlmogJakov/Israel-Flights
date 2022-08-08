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

function useNull() {
  return null;
}

// https://stackoverflow.com/questions/27101240/typeerror-converting-circular-structure-to-json-in-nodejs
const replacerFunc = () => {
  const visited = new WeakSet();
  return (key, value) => {
    if (typeof value === "object" && value !== null) {
      if (visited.has(value)) {
        return;
      }
      visited.add(value);
    }
    return value;
  };
};

const flightsDetails = (req, res) => {
  axios
    .get(
      "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
    )
    .then(async function (response) {
      // handle success
      data = response.data;
      // ------------- get basic info from flightradar24 -------------
      const json = JSON.parse(JSON.stringify(data));
      var keys = Object.keys(data);
      var TLVkeys = [];
      var TLVflights = {};
      for (var i = 2; i < keys.length - 1; i++) {
        var filghtID = keys[i];
        var onGround = json[filghtID][14];
        if (
          (onGround == "0" && json[filghtID][12] == "TLV") ||
          json[filghtID][11] == "TLV"
        ) {
          TLVkeys.push(filghtID);
          TLVflights[filghtID] = [];
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
            extended_info: {
              // init extended information
              period_type: null,
              month: null,
              day: null,
              company: null,
              src_country: null,
              dst_country: null,
              flight_duration_type: null,
              src_country_weather: null,
              dst_country_weather: null,
              arrival_type: null,
            },
          };
          TLVflights[filghtID].push(data);
        }
      }
      // ------------- get extended information from flightradar24 -------------
      let linksArr = [];
      for (const key of TLVkeys) {
        linksArr.push(
          `https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${key}`
        );
      }
      var extended_info;
      await axios
        // If there is an access that failed - assign the specific record to null (by calling 'useNull')
        .all(linksArr.map((l) => axios.get(l).catch(useNull)))
        .then(
          axios.spread(async function (...info) {
            //extended_info.push(info);
            extended_info = info;
          })
        )
        .catch((err) => {
          console.log("FAIL", err); // TODO: should throw error
        });
      //return res.status(200).json(extended_info[0]["data"]);
      for (var i = 0; i < extended_info.length; i++) {
        // if couldnt get extended info for specific flight then continue
        if (extended_info[i] == null) continue;
        // assign source country
        try {
          TLVflights[TLVkeys[i]][0]["extended_info"]["src_country"] =
            extended_info[i]["data"]["airport"]["origin"]["position"][
              "country"
            ]["name"];
        } catch (e) {
          console.log(`Misses destination country of flight ${TLVkeys[i]}`);
        }
        // assign destination country
        try {
          TLVflights[TLVkeys[i]][0]["extended_info"]["dst_country"] =
            extended_info[i]["data"]["airport"]["destination"]["position"][
              "country"
            ]["name"];
        } catch (e) {
          console.log(`Misses destination country of flight ${TLVkeys[i]}`);
        }
      }
      return res.status(200).json(TLVflights);
    })
    .catch(function (error) {
      console.log("Failed to get basic info from flightradar24", error);
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
