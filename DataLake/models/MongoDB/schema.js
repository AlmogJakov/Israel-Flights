const connect = require("./connect"); // Connect to MongoDB Compass
const mongoose = require("mongoose");

const flightDetailsSchema = new mongoose.Schema(
  {
    flightID: {
      type: String,
      required: true,
    },
    periodType: String,
    month: String,
    day: String,
    company: String,
    srcCountry: String,
    dstCountry: String,
    flightDurationType: String,
    srcCountryWeather: String,
    dstCountryWeather: String,
    arrivalTimeType: String,
  },
  { versionKey: false, timestamps: true }
);

const flightDetails = mongoose.model("flightDetails", flightDetailsSchema);

module.exports = flightDetails;
