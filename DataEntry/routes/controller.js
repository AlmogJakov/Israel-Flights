const express = require("express");
const axios = require("axios");
const router = express.Router();
var mysql = require("../models/mysql");
var fill_flights_details = require("../models/fillExtendedDetails");
var fill_weather_details = require("../models/fillWeatherDetails");
var fill_period_details = require("../models/fillPeriodDetails");
var getFlights = require("../models/getFlights");

// ------------------------------------ Log to file -------------------------------------
// source: https://stackoverflow.com/questions/41232578/node-js-console-log-in-txt-file
var log4js = require("log4js");
log4js.configure({
  appenders: {
    fileLog: { type: "file", filename: "logs/mylog.log" },
    console: { type: "console" },
  },
  categories: {
    file: { appenders: ["fileLog"], level: "error" },
    another: { appenders: ["console"], level: "trace" },
    default: { appenders: ["console", "fileLog"], level: "trace" },
  },
});
var logger = log4js.getLogger("fileLog");
//logger.debug("Cheese is not a food.");
// ---------------------------------- END Log to file -----------------------------------

// auto format code: https://blog.yogeshchavan.dev/automatically-format-code-on-file-save-in-visual-studio-code-using-prettier

// ----------------- Produce flights -----------------
const kafka = require("../models/produceKafka");
// async function that writes a new message each second: https://www.sohamkamani.com/nodejs/working-with-kafka/
const produce = async () => {
  var prev_flights = {};
  let i = 0;
  // after the produce has connected, we start an interval timer
  produce_func = async () => {
    try {
      await axios
        .get(
          "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
        )
        .then(async function (response) {
          // handle success
          data = response.data;
          // ----------- filter the basic flights info from flightradar24 ----------
          var flights = await getFlights.get_details(data);

          // Example of Difference operation between 2 dictionaries
          arrA = { firstName: "Jean-Luc", one: "Picard" };
          arrB = { firstName: "Jean-Luc", two: "Picard" };
          var arrB_keys = Object.keys(arrB);
          difference = Object.fromEntries(
            Object.entries(arrA).filter(([key]) => !arrB_keys.includes(key))
          );
          // merge the new flights records with the landed flights records
          var merged = Object.assign({}, arrB, res);
          console.log(merged);

          prev_flights = flights;
          // ------------- get extended information from flightradar24 -------------
          // SHOULD UNCOMMENT THE FOLLOWING LINES: (To actually produce to 'kafka' and write to MySQL)
          // extended_flights = await fill_flights_details.fill_details(flights);
          // extended_flights = await fill_weather_details.fill_details(
          //   extended_flights
          // );
          // extended_flights = await fill_period_details.fill_details(
          //   extended_flights
          // );
          // kafka.publish(JSON.stringify(extended_flights));
          // mysql.access_writing("flightradar24");
        })
        .catch(function (error) {
          console.log("Failed to get basic info from flightradar24", error);
        })
        .then(function () {
          // always executed
        });
      console.log("writes: ", i);
      i++;
    } catch (err) {
      console.error("could not write message " + err);
    }
  };
  // First, call the produce function immediately
  produce_func();
  // Call the produce function every 20 seconds
  setInterval(produce_func, 20000);
};
produce();

// ----------------- Client -----------------
// Return current flight details to client via api
const api = require("../models/api");
router.get("/", api.flightsDetails);
module.exports = router;
