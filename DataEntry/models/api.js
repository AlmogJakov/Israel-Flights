const axios = require("axios");
var mysql = require("./mysql");
var fill_extended_details = require("./fillExtendedDetails");
var fill_weather_details = require("./fillWeatherDetails");
var fill_period_details = require("./fillPeriodDetails");
var getFlights = require("./getFlights");
const kafka = require("./produceKafka");

var iteratorCounter = 0;
var prev_flights = {};
var api_output = {};
// waiting delay in milli seconds
var waitingDelay = 20000;

const api = {
  Run: async function () {
    // First, call the produce function immediately
    mysql.access_writing("flightradar24");
    await api.Iterate();
    console.log(`Waiting ${waitingDelay / 1000} seconds before next produce..`);
    // Call the produce function every 20 seconds
    setInterval(async function () {
      mysql.access_writing("flightradar24");
      await api.Iterate();
      console.log(`Waiting ${waitingDelay / 1000} seconds before next produce..`);
    }, waitingDelay); // TODO: fix overlapping produces
  },

  Iterate: async function () {
    await axios
      .get(
        "https://data-cloud.flightradar24.com/zones/fcgi/feed.js?faa=1&bounds=41.449%2C21.623%2C16.457%2C53.063&satellite=1&mlat=1&flarm=1&adsb=1&gnd=1&air=1&vehicles=1&estimated=1&maxage=14400&gliders=1&stats=1"
      )
      .then(async function (response) {
        console.log("");
        console.log("writes: ", iteratorCounter);
        iteratorCounter++;
        // handle success
        data = response.data;
        // ----------- filter the basic flights info from flightradar24 ----------
        var curr_flights = await getFlights.get_relevant_flights(data);
        landed_flights = await getFlights.get_landed_flights(prev_flights, curr_flights);
        // ------------- get extended information from flightradar24 -------------
        // SHOULD UNCOMMENT THE FOLLOWING LINES: (To actually produce to 'kafka' and write to MySQL)
        mysql.access_writing("flightradar24");
        extended_flights = await fill_extended_details.fill_details(curr_flights);
        mysql.access_writing("openweathermap");
        extended_flights = await fill_weather_details.fill_details(extended_flights);
        mysql.access_writing("hebcal");
        extended_flights = await fill_period_details.fill_details(extended_flights);
        // assign the new extended records BEFORE merging with 'landed_flights'
        prev_flights = JSON.parse(JSON.stringify(extended_flights)); // deep copy (?)
        // merge the new extended records with updated 'landed_flights' records
        extended_flights = Object.assign({}, extended_flights, landed_flights);
        api_output = extended_flights;
        kafka.publish(JSON.stringify(extended_flights));
      })
      .catch(async function (error) {
        console.log("Failed to get basic info from flightradar24", error);
      })
      .then(async function () {
        // always executed
      });
  },

  getOutput: function () {
    return JSON.parse(JSON.stringify(api_output));
  },
};

module.exports = api;
