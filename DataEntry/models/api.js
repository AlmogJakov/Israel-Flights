var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
var getFlights_details = require("./fullFlightsDetails");
var getWeather_details = require("./weatherDetails");
router = express.Router();

const flightsDetails = (req, res) => {
  axios
    .get(
      "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
    )
    .then(async function (response) {
      // handle success
      data = response.data;
      // -------------- get basic flights info from flightradar24 --------------
      //console.log(JSON.stringify(data));
      var keys = Object.keys(data);
      // remove 'stats'
      delete data[keys[keys.length - 1]];
      // remove 'version'
      delete data[keys[1]];
      // remove 'full_count'
      delete data[keys[0]];
      // ------------ filter the data (keeping flights from/to TLV) ------------
      var keys = Object.keys(data);
      keys.forEach(function (key) {
        if (data[key][11] != "TLV" && data[key][12] != "TLV") delete data[key];
      });
      const json = JSON.parse(JSON.stringify(data));
      var keys = Object.keys(data);
      // ------------- get extended information from flightradar24 -------------
      extended_flights = await getFlights_details.get_details(json, keys);
      extended_flights = await getWeather_details.get_details(extended_flights);
      return res.status(200).json(extended_flights);
    })
    .catch(function (error) {
      console.log("Failed to get info", error);
    })
    .then(function () {
      // always executed
    });
};

module.exports = {
  flightsDetails,
};
