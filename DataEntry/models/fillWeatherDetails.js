var express = require("express");
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

const api_key = "bf97b4fc3170f7d6ebdd76d544691edf";

// -------------- Return null --------------
function useNull() {
  return null;
}

const weather_details = {
  fill_details: async function (extended_flights) {
    // ------------- get weather information from openweathermap -------------
    var keys = Object.keys(extended_flights);
    let linksArr = [];
    for (const key of keys) {
      src_airport_latitude =
        extended_flights[key][0]["extended_info"]["src_airport_latitude"];
      src_airport_longitude =
        extended_flights[key][0]["extended_info"]["src_airport_longitude"];
      dst_airport_latitude =
        extended_flights[key][0]["extended_info"]["dst_airport_latitude"];
      dst_airport_longitude =
        extended_flights[key][0]["extended_info"]["dst_airport_longitude"];
      linksArr.push(
        `https://api.openweathermap.org/data/2.5/weather?lat=${src_airport_latitude}&lon=${src_airport_longitude}&appid=${api_key}`
      );
      linksArr.push(
        `https://api.openweathermap.org/data/2.5/weather?lat=${dst_airport_latitude}&lon=${dst_airport_longitude}&appid=${api_key}`
      );
    }
    var weather_info;
    await axios
      // If there is an access that failed - assign the specific record to null (by calling 'useNull')
      .all(linksArr.map((l) => axios.get(l).catch(useNull)))
      .then(
        axios.spread(async function (...info) {
          weather_info = info;
        })
      )
      .catch((err) => {
        console.log("FAIL", err); // TODO: should throw error
      });
    for (var i = 0; i < keys.length; i++) {
      // If null then failed to get weather info for specific flight
      if (weather_info[i * 2] == null || weather_info[i * 2 + 1] == null) {
        console.log(
          // print in red color
          "\u001b[31m" +
            `Couldn't receive weather data of flight ${keys[i]}` +
            "\u001b[0m"
        );
        continue;
      }
      // Assign src/dst airport latitude/longitude
      try {
        extended_flights[keys[i]][0]["extended_info"]["src_country_weather"] =
          weather_info[i * 2]["data"]["weather"][0]["main"];
        extended_flights[keys[i]][0]["extended_info"]["dst_country_weather"] =
          weather_info[i * 2 + 1]["data"]["weather"][0]["main"];
      } catch (e) {
        console.log(
          `Misses src/dst airport latitude/longitude of flight ${keys[i]}`
        );
      }
    }
    return extended_flights;
  },
};

module.exports = weather_details;
