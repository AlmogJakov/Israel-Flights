var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
var getFlights_details = require("./fillExtendedDetails");
var getWeather_details = require("./fillWeatherDetails");
var getFlights = require("./getFlights");
router = express.Router();

const flightsDetails = (req, res) => {
  axios
    // --------------- get basic flights info from flightradar24 ---------------
    .get(
      "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
    )
    .then(async function (response) {
      // handle success
      data = response.data;
      // ----------- filter the basic flights info from flightradar24 ----------
      var flights = await getFlights.get_details(data);
      // ------------- get extended information from flightradar24 -------------
      extended_flights = await getFlights_details.get_details(flights);
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
