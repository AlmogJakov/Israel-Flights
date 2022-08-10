var express = require("express");
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

const flights = {
  get_relevant_flights: async function (data) {
    // ------------------- remove unnecessary information -------------------
    var keys = Object.keys(data);
    // remove 'stats' information
    delete data[keys[keys.length - 1]];
    // remove 'version' information
    delete data[keys[1]];
    // remove 'full_count' information
    delete data[keys[0]];
    // ---------- filter the data (keeping flights only from/to TLV) ----------
    var keys = Object.keys(data);
    keys.forEach(function (key) {
      if ((data[key][11] != "TLV" && data[key][12] != "TLV") || data[key][14] != "0") delete data[key];
    });
    return data;
  },

  get_landed_flights: async function (prev_flights, curr_flights) {
    // --------------------- get landed flights records ----------------------
    /* 
          The indication of a landed flight is if the flight has disappeared 
          in the current sample (calculated using the Difference operation) 
          and the flight actually took off (real_departure_time!=null)
          */
    var curr_flights_keys = Object.keys(curr_flights);
    landed_flights = Object.fromEntries(
      Object.entries(prev_flights).filter(
        ([key]) =>
          !curr_flights_keys.includes(key) && prev_flights[key][0]["extended_info"]["real_departure_time"] != "null"
      )
    );

    //console.log(Object.fromEntries(Object.entries(prev_flights).filter(([key]) => !curr_flights_keys.includes(key))));

    // FOLLOWING LINES JUST FOR TESTING!!!
    console.log(`prevSize: ${Object.keys(prev_flights).length}. curSize: ${Object.keys(curr_flights).length}`);
    landed_flights_keys = Object.keys(landed_flights);
    if (landed_flights_keys.length != 0) {
      console.log(prev_flights[landed_flights_keys[0]][0]["extended_info"]["real_departure_time"]);
      console.log(`landed flights found: ${landed_flights_keys}`);
    }
    //////////////////////////////////////

    // assign landed=true for each record in 'landed_flights' dictionary
    for (let key in landed_flights) {
      landed_flights[key][0]["landed"] = true;
    }
    return landed_flights;
  },
};

module.exports = flights;
