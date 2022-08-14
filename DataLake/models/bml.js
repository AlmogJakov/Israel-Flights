var bigml = require("bigml");
var fs = require("fs");
const fsPromises = fs.promises;
var mongodb = require("./MongoDB/mongodb");
var kafkaML = require("./produceKafkaML");
// https://bigml.com/dashboard/datasets
var connection = new bigml.BigML("almog1006", "4c50b7ad4f22a8a4e3bc6c23623d299f466ce991");
var source = new bigml.Source(connection);

const BigML = {
  // Create a new model (using the flight records that created within the input date range)
  createModel: async function (dateRange) {
    records = await mongodb.export2csv(dateRange);
    if (records == 0) {
      console.log(`Didn't find any records in the date range: ${dateRange}`);
      return 0;
    }
    await sleep(200);
    var sourceInfoV = await sourceInfo();
    const dataset = new bigml.Dataset(connection);
    var datasetInfoV = await datasetInfo(dataset, sourceInfoV);
    var model = new bigml.Model(connection);
    var modelInfoV = await modelInfo(model, datasetInfoV);
    await fsPromises
      .writeFile("model.txt", modelInfoV.object.resource)
      .then(() => {
        console.log("\u001b[35m" + `Model Created!` + "\u001b[0m");
      })
      .catch((er) => {
        console.log(er);
      });
    return records;
  },

  // BigML assumes that the parameter we want to predict is in the last column
  predictAll: async function (flightsToPredict) {
    var prediction = new bigml.Prediction(connection);
    var data = JSON.parse(flightsToPredict);
    var keys = Object.keys(data);
    var resultPromises = [];
    for (const key of keys) {
      toPredict = {
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
        arrivalTimeType: 0,
      };
      resultPromises.push(BigML.predict(prediction, toPredict));
      //var res = await BigML.predict(prediction, toPredict);
      //console.log(res);
    }
    await Promise.all(resultPromises).then((values) => {
      console.log(values);
      kafkaML.publish(JSON.stringify(values));
    });
  },

  // BigML assumes that the parameter we want to predict is in the last column
  predict: async function (prediction, toPredict) {
    var res;
    await fsPromises
      .readFile("model.txt", "utf8")
      .then(async function (data) {
        var predictionV = await predictBigML(prediction, data, toPredict);
        var result = predictionV.object.output + "";
        res = result;
      })
      .catch((er) => {
        console.log(er);
      });
    return res;
  },
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// The following three functions intended for creating a BigML model
async function sourceInfo() {
  return new Promise(async function (resolve, reject) {
    await source.create("flightDetails.csv", async function (error, sourceInfo) {
      if (!error && sourceInfo) {
        resolve(sourceInfo);
      } else {
        reject(error);
      }
    });
  });
}
async function datasetInfo(dataset, sourceInfo) {
  return new Promise(async function (resolve, reject) {
    await dataset.create(sourceInfo, async function (error, datasetInfo) {
      if (!error && datasetInfo) {
        resolve(datasetInfo);
      } else {
        reject(error);
      }
    });
  });
}
async function modelInfo(model, datasetInfo) {
  return new Promise(async function (resolve, reject) {
    await model.create(datasetInfo, async function (error, modelInfo) {
      if (!error && modelInfo) {
        resolve(modelInfo);
      } else {
        reject(error);
      }
    });
  });
}

// The following function intended for BigML prediction
async function predictBigML(prediction, data, toPredict) {
  return new Promise(async function (resolve, reject) {
    await prediction.create(data, toPredict, async function (error, prediction) {
      if (!error && prediction) {
        resolve(prediction);
      } else {
        reject(error);
      }
    });
  });
}

module.exports = BigML;
