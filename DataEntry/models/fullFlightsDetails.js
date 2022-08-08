var express = require("express");
//const config = require('../config');
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

function useNull() {
  return null;
}

const flights_details = {
  get_details: async function (json, keys) {
    var TLVkeys = [];
    var TLVflights = {};
    for (var i = 2; i < keys.length - 1; i++) {
      var filghtID = keys[i];
      var onGround = json[filghtID][14];
      if (
        (onGround == "0" && json[filghtID][12] == "TLV") ||
        json[filghtID][11] == "TLV"
      ) {
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
        console.log(`Couldn't receive extended data of flight ${TLVkeys[i]}`);
        continue;
      }
      // Assign source country
      try {
        TLVflights[TLVkeys[i]][0]["extended_info"]["src_country"] =
          extended_info[i]["data"]["airport"]["origin"]["position"]["country"][
            "name"
          ];
      } catch (e) {
        console.log(`Misses destination country of flight ${TLVkeys[i]}`);
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
    }
    return TLVflights;
  },
};

module.exports = flights_details;
