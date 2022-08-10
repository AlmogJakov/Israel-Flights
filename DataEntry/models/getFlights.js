var express = require("express");
const axios = require("axios");
var router = require("../routes/controller");
router = express.Router();

const flights = {
  get_details: async function (data) {
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
      if (data[key][11] != "TLV" && data[key][12] != "TLV") delete data[key];
    });
    return data;
  },
};

module.exports = flights;
