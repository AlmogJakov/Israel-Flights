var express = require("express");
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

// ----------------------------------- Events ------------------------------------
const events = [
  // ----- Major holidays -----
  "Rosh Hashana",
  "Yom Kippur",
  "Sukkot",
  "Shmini Atzeret",
  "Simchat Torah",
  "Chanukah",
  "Pesach",
  "Shavuot",
  // ----- Minor holidays -----
  "Tu BiShvat",
  "Purim",
  //"Shushan Purim",
  //"Days of the Omer",
  //"Pesach Sheni",
  //"Lag BaOmer",
  //"Tu B'Av",
  //"Rosh Hashana LaBehemot",
  //"Leil Selichot",
  //"Purim Katan",
];

const summer_vacations = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// -------------- Return null --------------
function useNull() {
  return null;
}

// https://www.hebcal.com/converter?cfg=json&date=2011-06-02&g2h=1&strict=1
// https://www.hebcal.com/holidays/?i=on

const period_details = {
  fill_details: async function (extended_flights) {
    // ------------- get period information from hebcal.com -------------
    var keys = Object.keys(extended_flights);
    let linksArr = [];
    for (const key of keys) {
      flight_time = extended_flights[key][0]["extended_info"]["real_departure_time"];
      if (flight_time == "null") flight_time = extended_flights[key][0]["extended_info"]["scheduled_departure_time"];
      if (flight_time == "null") flight_time = extended_flights[key][0]["extended_info"]["estimated_departure_time"];
      if (flight_time != "null") {
        var date = new Date(flight_time * 1000);
        var formated_date = date.toISOString().split("T")[0];
      } else {
        // if couldn't found departure time then assign null manually (because new Date(null) = 1970-01-01)
        formated_date = null;
      }
      linksArr.push(`https://www.hebcal.com/converter?cfg=json&date=${formated_date}&g2h=1&strict=1`);
    }
    var period_info;
    await axios
      // If there is an access that failed - assign the specific record to null (by calling 'useNull')
      .all(linksArr.map((l) => axios.get(l).catch(useNull)))
      .then(
        axios.spread(async function (...info) {
          period_info = info;
        })
      )
      .catch((err) => {
        console.log("FAIL", err); // TODO: should throw error
      });
    for (var i = 0; i < keys.length; i++) {
      // If null then failed to get period info for specific flight
      if (period_info[i] == null) {
        console.log(
          // print in red color
          "\u001b[31m" + `Couldn't receive period info of flight ${keys[i]}` + "\u001b[0m"
        );
        continue;
      }
      // Assign period info
      try {
        // https://stackoverflow.com/questions/5582574/how-to-check-if-a-string-contains-text-from-an-array-of-substrings-in-javascript
        var event = period_info[i]["data"]["events"][0];
        //console.log(`${event} ${keys[i]}`);
        // check if the first event contains one of the holiday events
        if (events.some((v) => event.includes(v))) {
          extended_flights[keys[i]][0]["extended_info"]["period_type"] = "Holiday";
        } else {
          // Check if the departure is during summer vacation (July or August)
          flight_month = extended_flights[keys[i]][0]["extended_info"]["month"];
          if (flight_month == "August" || flight_month == "July") {
            extended_flights[keys[i]][0]["extended_info"]["period_type"] = "Summer Vacation";
            // Else, assign as a regular day
          } else if (flight_month != null) {
            extended_flights[keys[i]][0]["extended_info"]["period_type"] = "Regular";
          } else {
            console.log(`Misses period info of flight ${keys[i]}. month value is null`);
          }
        }
      } catch (e) {
        console.log(`Misses period info of flight ${keys[i]}`);
      }
    }
    return extended_flights;
  },
};

module.exports = period_details;
