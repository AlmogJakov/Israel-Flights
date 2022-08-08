var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();
var cities = require("smart-city-finder");

// https://api.openweathermap.org/data/2.5/weather?q=Tel-Aviv&appid=bf97b4fc3170f7d6ebdd76d544691edf
// https://api.openweathermap.org/data/2.5/weather?zip={zip code},{country code}&appid={API key}

const weather = {
  // get Weather by longitude (lon) and latitude (lat)
  getWeather: function (lon, lat) {
    zipcode = cities.gps_lookup(lat, lon)["zipcode"];
    axios
      .get(
        `https://api.openweathermap.org/data/2.5/weather?zip=${zipcode}&appid=bf97b4fc3170f7d6ebdd76d544691edf`
      )
      .then(function (response) {
        // handle success
        data = response.data;
        var keys = Object.keys(data);
        const json = JSON.parse(JSON.stringify(data));
        //console.log(json);
        console.log(json["weather"][0]["main"]);
        return json;
      });
  },
};

module.exports = weather;
