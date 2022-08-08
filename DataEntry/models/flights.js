var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

var data = {};

async function getMoreFlightInfo(flightID) {
  return await axios
    .get(
      `https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${flightID}`
    )
    .then(function (response) {
      // handle success
      data = response.data;
      //var keys = Object.keys(data);
      //const json = JSON.parse(JSON.stringify(data));
      //console.log(json);
      //console.log(flightID);
      //console.log(json["airport"]["origin"]["position"]["longitude"]);
      return data;
    });
}

async function iterateFlights(database) {
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
      // get extended information
      //console.log(getMoreFlightInfo(filghtID));

      var moreinfo;
      await getMoreFlightInfo(filghtID).then((extendedFlightInfo) => {
        moreinfo = extendedFlightInfo;
        //console.log(extendedFlightInfo);
        // var src_longitude =
        //   moreinfo["airport"]["origin"]["position"]["longitude"];
        // var src_latitude =
        //   moreinfo["airport"]["origin"]["position"]["latitude"];
        // var dst_longitude =
        //   moreinfo["airport"]["destination"]["position"]["longitude"];
        // var dst_latitude =
        //   moreinfo["airport"]["destination"]["position"]["latitude"];
        // //var src_lon =
        // var src_weather = weather.getWeather(src_longitude, src_latitude);
        // var dst_weather = weather.getWeather(dst_longitude, dst_latitude);
        //return data;
      });

      // var mydata = getMoreFlightInfo(filghtID);
      //console.log(mydata);

      // var moreinfo = JSON.parse(JSON.stringify(getMoreFlightInfo(filghtID)));
      var src_longitude =
        moreinfo["airport"]["origin"]["position"]["longitude"];
      var src_latitude = moreinfo["airport"]["origin"]["position"]["latitude"];
      var dst_longitude =
        moreinfo["airport"]["destination"]["position"]["longitude"];
      var dst_latitude =
        moreinfo["airport"]["destination"]["position"]["latitude"];
      // //var src_lon =
      // var src_weather = weather.getWeather(src_longitude, src_latitude);
      // var dst_weather = weather.getWeather(dst_longitude, dst_latitude);
      var data = {
        id: filghtID,
        on_ground: onGround,
        coordinate_x: coordinateX,
        coordinate_y: coordinateY,
        degree: degree,
        time: time,
        source: src,
        destination: dst,
        src_longitude: src_longitude,
        src_latitude: src_latitude,
        dst_longitude: dst_longitude,
        dst_latitude: dst_latitude,
        //src_weather: src_weather,
        //dst_weather: dst_weather,
      };
      result[filghtID].push(data);
    }
  }
  return result;
}

const flightsDetails = async (req, res) => {
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

const flight = {
  // get Weather by longitude (lon) and latitude (lat)
  getMoreFlightInfo: function (flightID) {
    axios
      .get(
        `https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${flightID}`
      )
      .then(function (response) {
        // handle success
        data = response.data;
        var keys = Object.keys(data);
        const json = JSON.parse(JSON.stringify(data));
        //console.log(json);
        console.log(json["airport"]["origin"]["name"]);
        return json;
      });
  },
};

// router.get('/', function(req, res, next) {
//   res.render('index', {title: 'Express'});
// });

module.exports = {
  flightsDetails,
};
