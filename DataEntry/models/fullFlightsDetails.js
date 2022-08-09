var express = require("express");
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

// --------------------- Get distance from latitude and longitude ---------------------
// This function takes in latitude and longitude of two location
// and returns the distance between them as the crow flies (in km)
// Source: https://stackoverflow.com/questions/18883601/function-to-calculate-distance-between-two-coordinates
function calcCrow(lat1, lon1, lat2, lon2) {
  var R = 6371; // km
  var dLat = toRad(lat2 - lat1);
  var dLon = toRad(lon2 - lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) {
  return (Value * Math.PI) / 180;
}

// ------------------------------- Get date from timestamp -------------------------------
const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const dayNames = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

// Get date from timestamp
function getDate(timestamp) {
  return new Date(timestamp * 1000);
}

// -------------------------------------- Return null --------------------------------------
function useNull() {
  return null;
}

const flights_details = {
  get_details: async function (json, keys) {
    var TLVkeys = [];
    var TLVflights = {};
    for (var i = 0; i < keys.length; i++) {
      var filghtID = keys[i];
      var onGround = json[filghtID][14];
      if (onGround == "0") {
        TLVkeys.push(filghtID);
        TLVflights[filghtID] = [];
        var coordinateX = json[filghtID][1];
        var coordinateY = json[filghtID][2];
        var degree = json[filghtID][3];
        var time = json[filghtID][10];
        var src = json[filghtID][11];
        var dst = json[filghtID][12];
        var data = {
          id: filghtID,
          on_ground: onGround,
          coordinate_x: coordinateX,
          coordinate_y: coordinateY,
          degree: degree,
          time: time,
          source: src,
          destination: dst,
          extended_info: {
            // init extended information
            period_type: null,
            month: null,
            day: null,
            company: null,
            src_country: null,
            dst_country: null,
            flight_duration_type: null,
            src_airport_latitude: null,
            src_airport_longitude: null,
            dst_airport_latitude: null,
            dst_airport_longitude: null,
            src_country_weather: null,
            dst_country_weather: null,
            //arrival_type: null,
            status_live: null,
            status_text: null,
            scheduled_departure_time: null,
            scheduled_arrival_time: null,
            real_departure_time: null,
            real_arrival_time: null,
            estimated_departure_time: null,
            estimated_arrival_time: null,
          },
        };
        TLVflights[filghtID].push(data);
      }
    }
    // ------------- get extended information from flightradar24 -------------
    let linksArr = [];
    for (const key of TLVkeys) {
      linksArr.push(
        `https://data-live.flightradar24.com/clickhandler/?version=1.5&flight=${key}`
      );
    }
    var extended_info;
    await axios
      // If there is an access that failed - assign the specific record to null (by calling 'useNull')
      .all(linksArr.map((l) => axios.get(l).catch(useNull)))
      .then(
        axios.spread(async function (...info) {
          //extended_info.push(info);
          extended_info = info;
        })
      )
      .catch((err) => {
        console.log("FAIL", err); // TODO: should throw error
      });
    //return res.status(200).json(extended_info[0]["data"]);

    for (var i = 0; i < extended_info.length; i++) {
      // If null then failed to get extended info for specific flight
      if (extended_info[i] == null) {
        console.log(
          // print in red color
          "\u001b[31m" +
            `Couldn't receive extended data of flight ${TLVkeys[i]}` +
            "\u001b[0m"
        );
        continue;
      }
      // Assign source country
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["src_country"] =
          extended_info[i]["data"]["airport"]["origin"]["position"]["country"][
            "name"
          ];
      } catch (e) {
        console.log(`Misses source country of flight ${TLVkeys[i]}`);
      }
      // Assign destination country
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["dst_country"] =
          extended_info[i]["data"]["airport"]["destination"]["position"][
            "country"
          ]["name"];
      } catch (e) {
        console.log(`Misses destination country of flight ${TLVkeys[i]}`);
      }
      // Assign flight company
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["company"] =
          extended_info[i]["data"]["airline"]["short"];
      } catch (e) {
        console.log(`Misses company info of flight ${TLVkeys[i]}`);
      }
      // Assign status live
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["status_live"] =
          extended_info[i]["data"]["status"]["live"];
      } catch (e) {
        console.log(`Misses status live info of flight ${TLVkeys[i]}`);
      }
      // Assign status text
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["status_text"] =
          extended_info[i]["data"]["status"]["text"];
      } catch (e) {
        console.log(`Misses status text info of flight ${TLVkeys[i]}`);
      }
      // Assign scheduled departure time
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["scheduled_departure_time"] =
          extended_info[i]["data"]["time"]["scheduled"]["departure"];
      } catch (e) {
        console.log(
          `Misses scheduled departure time info of flight ${TLVkeys[i]}`
        );
      }
      // Assign scheduled arrival time
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["scheduled_arrival_time"] =
          extended_info[i]["data"]["time"]["scheduled"]["arrival"];
      } catch (e) {
        console.log(
          `Misses scheduled arrival time info of flight ${TLVkeys[i]}`
        );
      }
      // Assign real departure time
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["real_departure_time"] =
          extended_info[i]["data"]["time"]["real"]["departure"];
      } catch (e) {
        console.log(`Misses real departure time info of flight ${TLVkeys[i]}`);
      }
      // Assign real arrival time
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["real_arrival_time"] =
          extended_info[i]["data"]["time"]["real"]["arrival"];
      } catch (e) {
        console.log(`Misses real arrival time info of flight ${TLVkeys[i]}`);
      }
      // Assign estimated departure time
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["estimated_departure_time"] =
          extended_info[i]["data"]["time"]["estimated"]["departure"];
      } catch (e) {
        console.log(
          `Misses estimated departure time info of flight ${TLVkeys[i]}`
        );
      }
      // Assign estimated arrival time
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["estimated_arrival_time"] =
          extended_info[i]["data"]["time"]["estimated"]["arrival"];
      } catch (e) {
        console.log(
          `Misses estimated arrival time info of flight ${TLVkeys[i]}`
        );
      }
      // Assign month and day of flight
      try {
        flight_time = extended_info[i]["data"]["time"]["real"]["departure"];
        if (flight_time == "null")
          flight_time =
            extended_info[i]["data"]["time"]["scheduled"]["departure"];
        if (flight_time == "null")
          flight_time =
            extended_info[i]["data"]["time"]["estimated"]["departure"];
        var flight_date = getDate(flight_time);
        var month = monthNames[flight_date.getMonth()];
        var day = dayNames[flight_date.getDay()];
        TLVflights[TLVkeys[i]][0]["extended_info"]["month"] = month;
        TLVflights[TLVkeys[i]][0]["extended_info"]["day"] = day;
        //dateString = theDate.toGMTString();
      } catch (e) {
        console.log(`Misses month/day of flight info of flight ${TLVkeys[i]}`);
      }
      // Assign flight duration type via airports latitude/longitude
      try {
        // get latitude/longitude of src and dst airports
        src_lat =
          extended_info[i]["data"]["airport"]["origin"]["position"]["latitude"];
        src_lon =
          extended_info[i]["data"]["airport"]["origin"]["position"][
            "longitude"
          ];
        dst_lat =
          extended_info[i]["data"]["airport"]["destination"]["position"][
            "latitude"
          ];
        dst_lon =
          extended_info[i]["data"]["airport"]["destination"]["position"][
            "longitude"
          ];
        // assign latitude/longitude of src and dst airports
        TLVflights[TLVkeys[i]][0]["extended_info"]["src_airport_latitude"] =
          src_lat;
        TLVflights[TLVkeys[i]][0]["extended_info"]["src_airport_longitude"] =
          src_lon;
        TLVflights[TLVkeys[i]][0]["extended_info"]["dst_airport_latitude"] =
          dst_lat;
        TLVflights[TLVkeys[i]][0]["extended_info"]["dst_airport_longitude"] =
          dst_lon;
        // calc and assign the flight duration type
        distance = calcCrow(src_lat, src_lon, dst_lat, dst_lon);
        duration_type =
          distance <= 1500 ? "short" : distance <= 3500 ? "average" : "long";
        TLVflights[TLVkeys[i]][0]["extended_info"]["flight_duration_type"] =
          duration_type;
      } catch (e) {
        console.log(
          `Misses flight duration type (via airports latitude/longitude) of flight ${TLVkeys[i]}`
        );
      }
    }
    return TLVflights;
  },
};

module.exports = flights_details;
