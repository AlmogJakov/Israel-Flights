const fs = require("fs");
const Json2csvParser = require("json2csv").Parser;
const flightsCollection = require("./schema");

// https://cloud.mongodb.com/v2/62f4d5a92511ff28eacbc5f9#metrics/replicaSet/62f4d74129b9e928619293a1/explorer/big-data/flightdetails/find

// Finding the time difference in minutes given 2 timestamps
function diff_minutes(dt2, dt1) {
  var diff = (dt2.getTime() - dt1.getTime()) / 1000;
  diff /= 60;
  return Math.abs(Math.round(diff));
}

const MongoDB = {
  saveFlightsDetails: function (flights) {
    var data = JSON.parse(flights);
    var keys = Object.keys(data);
    keys.forEach(function (key) {
      scheduled_arrival_time = data[key][0]["extended_info"]["scheduled_arrival_time"];
      actual_arrival_time = data[key][0]["extended_info"]["real_arrival_time"];
      if (actual_arrival_time == null) actual_arrival_time = data[key][0]["extended_info"]["estimated_arrival_time"];
      if (data[key][0]["landed"] == true && scheduled_arrival_time != null && actual_arrival_time != null) {
        var diff = diff_minutes(new Date(scheduled_arrival_time * 1000), new Date(actual_arrival_time * 1000));
        var arrival_time_type;
        if (diff < 15) arrival_time_type = "Normal";
        else if (diff <= 60) arrival_time_type = "Delay";
        else arrival_time_type = "Heavy Delay";
        // TODO: dont save records with null field value !
        const flight = new flightsCollection({
          flightID: key,
          periodType: data[key][0]["extended_info"]["period_type"],
          month: data[key][0]["extended_info"]["month"],
          day: data[key][0]["extended_info"]["day"],
          company: data[key][0]["extended_info"]["company"],
          srcCountry: data[key][0]["extended_info"]["src_country"],
          dstCountry: data[key][0]["extended_info"]["dst_country"],
          flightDurationType: data[key][0]["extended_info"]["flight_duration_type"],
          srcCountryWeather: data[key][0]["extended_info"]["src_country_weather"],
          dstCountryWeather: data[key][0]["extended_info"]["dst_country_weather"],
          arrivalTimeType: arrival_time_type,
        });
        flight
          .save()
          .then(() => console.log(`Flight ${key} Inserted to MongoDB!`))
          .catch((err) => console.log(err));
      }
    });

    // const flight = new flightsCollection({
    //   flightID: "000",
    //   periodType: "000",
    //   month: "00a",
    //   day: "00b",
    //   company: "00c",
    //   srcCountry: "00d",
    //   dstCountry: "00e",
    //   flightDurationType: "00f",
    //   srcCountryWeather: "00g",
    //   dstCountryWeather: "00h",
    //   arrivalTimeType: "00i",
    // });

    //const flights = new flightsCollection(flights);
    //Enter flight details to DB
    // flight
    //   .save()
    //   .then(() => console.log("Inserted to MongoDB"))
    //   .catch((err) => console.log(err));
  },
  export2csv: async function () {
    //flightsCollection;
    // .find({}, { _id: 0 })
    flightsCollection
      .find({
        createdAt: {
          // Month parameter start from 0!
          // Therefore, for example, the august indicator is 7 (and not 8)
          $gte: new Date(2022, 7, 11), // From this day (Including this day)
          $lt: new Date(2022, 7, 12), // Until this day (but NOT including this day)
        },
      })
      .lean()
      .select("-_id -createdAt -updatedAt")
      .exec((err, data) => {
        // if (err) throw err;
        //console.log(data);

        const csvFields = [
          "flightID",
          "periodType",
          "month",
          "day",
          "company",
          "srcCountry",
          "dstCountry",
          "flightDurationType",
          "srcCountryWeather",
          "dstCountryWeather",
          "arrivalTimeType",
        ];
        const json2csvParser = new Json2csvParser({
          csvFields,
        });
        const csvData = json2csvParser.parse(data, csvFields);
        fs.writeFile("flightDetails.csv", csvData, function (error) {
          if (error) throw error;
          console.log("Write to flightDetails.csv successfully!");
        });
      });
  },
};

module.exports = MongoDB;
