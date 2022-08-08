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

      //data = iterateFlights(data);

      // get only TLV keys
      const json = JSON.parse(JSON.stringify(data));
      var keys = Object.keys(data);
      var TLVkeys = [];
      for (var i = 2; i < keys.length - 1; i++) {
        var filghtID = keys[i];
        var onGround = json[filghtID][14];
        if (
          (onGround == "0" && json[filghtID][12] == "TLV") ||
          json[filghtID][11] == "TLV"
        ) {
          TLVkeys.push(filghtID);
        }
      }
      //console.log(TLVkeys);

      let linksArr = [];
      for (const key of TLVkeys) {
        linksArr.push(
          `https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${key}`
        );
      }
      //console.log(linksArr.length);
      var dodo = [];
      await axios
        .all(linksArr.map((l) => axios.get(l).catch(useNull)))
        .then(
          //(data) => console.log(data)
          // function (response) {
          //   (response) => console.log(response);
          //   //return res.status(200).json(data[0]);
          // }
          //(data) => console.log(data[0])

          axios.spread(async function (...info) {
            // all requests are now complete
            //console.log(info.length);
            //console.log(info);
            //return info;
            //return res.status(200).json(info.data);
            dodo.push(info);
            //dodo = info.data;
            //dodo = structuredClone(info.data);
            //res.status(200).json(info.data);
            //console.log(keys);
          })
        )
        .catch((err) => {
          //console.log("FAIL", err);
          console.log("FAIL");
        });
      //console.log(dodo[0][0]["data"]);
      //console.log(JSON.stringify(dodo[0], replacerFunc())[0]);
      return res.status(200).json(dodo[0][0]["data"]);
      // console.log(dodo);
      //return res.send(JSON.parse(dodo));
      //console.log(dodo);
      //return dodo;
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
