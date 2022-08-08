var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
var getFlights_details = require("./fullFlightsDetails");
router = express.Router();

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
      // ------------- get extended information from flightradar24 -------------
      TLVflights = await getFlights_details.get_details(json, keys);
      return res.status(200).json(TLVflights);
    })
    .catch(function (error) {
      console.log("Failed to get basic info from flightradar24", error);
    })
    .then(function () {
      // always executed
    });
};

module.exports = {
  flightsDetails,
};
