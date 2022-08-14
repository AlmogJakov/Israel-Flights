var bigml = require("bigml");
var fs = require("fs");
const fsPromises = fs.promises;
var mongodb = require("./MongoDB/mongodb");
// https://bigml.com/dashboard/datasets
var connection = new bigml.BigML("almog1006", "4c50b7ad4f22a8a4e3bc6c23623d299f466ce991");
var source = new bigml.Source(connection);

// The following three functions for creating a BigML model
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

const BigML = {
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
  predict: async function (toPredict) {
    var prediction = new bigml.Prediction(connection);
    console.log("Prediction target:: " + toPredict);
    fs.readFile("model.txt", "utf8", function (err, data) {
      prediction.create(data, toPredict, function (error, prediction) {
        var result = prediction.object.output + "";
        fs.writeFile("predict.txt", result, (err) => {
          if (err) return console.log(err);
          console.log(result); // Output prediction
        });
      });
    });
  },
};

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

module.exports = BigML;
