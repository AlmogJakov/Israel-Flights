const fs = require("fs");
const fsPromises = fs.promises;
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
        // Note! There are problems when there is a missing field in the record stored in mongoDB
        // Therefore, dont save records with null field value (maybe the reason for the field's disappearance)
        // or maybe check the size of the record fields before storing in mongoDB
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
          .then(() => console.log("\u001b[32m" + `Flight ${key} Inserted to MongoDB!` + "\u001b[0m"))
          .catch((err) => console.log(err));
      }
    });
  },
  export2csv: async function (dateRange) {
    const datesArray = dateRange.split(">");
    startDate = new Date(datesArray[0]); // From this day (Including this day)
    endDate = new Date(datesArray[1]); // Until this day (but NOT including this day)
    // Add one day to endDate so the last day will be included in the calculation
    endDate.setDate(endDate.getDate() + 1); // Until this day (Including this day)
    var records = await flightsCollection
      .find({
        createdAt: {
          $gte: startDate,
          $lt: endDate,
        },
      })
      .lean()
      .select("-_id -createdAt -updatedAt");
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
    // Data should not be empty when calling 'json2csvParser'
    if (records.length == 0) {
      return 0;
    }
    const csvData = json2csvParser.parse(records, csvFields);
    await fs.writeFile("flightDetails.csv", csvData, function (error) {
      if (error) throw error;
      console.log("Write to flightDetails.csv successfully!");
    });
    return records.length;
  },
};

module.exports = MongoDB;
