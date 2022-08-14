var bigml = require("bigml");
var fs = require("fs");
var mongodb = require("./MongoDB/mongodb");

// https://bigml.com/dashboard/datasets

var connection = new bigml.BigML("almog1006", "4c50b7ad4f22a8a4e3bc6c23623d299f466ce991");

var source = new bigml.Source(connection);

const BigML = {
  createModel: async function (dateRange) {
    records = await mongodb.export2csv(dateRange);
    if (records == 0) {
      console.log(`Didn't find any records in the date range: ${dateRange}`);
      return 0;
    }
    await sleep(200);
    await source.create("flightDetails.csv", async function (error, sourceInfo) {
      if (!error && sourceInfo) {
        const dataset = new bigml.Dataset(connection);
        await dataset.create(sourceInfo, async function (error, datasetInfo) {
          if (!error && datasetInfo) {
            var model = new bigml.Model(connection);
            await model.create(datasetInfo, async function (error, modelInfo) {
              if (!error && modelInfo) {
                await fs.writeFile("model.txt", modelInfo.object.resource, (err) => {
                  if (err) {
                    console.log("BigML error:" + err);
                  } else {
                    console.log("Model created!");
                  }
                });
              }
            });
          }
        });
      } else {
        console.log("BigML error:" + error);
      }
    });
    //return "Model created!";
    return records;
    //return res;
  },

  // BigML assumes that the parameter we want to predict is in the last column
  predict: async function (toPredict) {
    var prediction = new bigml.Prediction(connection);
    console.log("========== WHAT PREDICT: " + toPredict);
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
