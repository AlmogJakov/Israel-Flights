var bigml = require('bigml');
var fs = require("fs");
var mongodb = require("./MongoDB/mongodb");

var connection = new bigml.BigML('LIORATIYA','32c48e9131baa4930cb24d5f094a0e6b12d7de01')
// var connection = new bigml.BigML('OFIRRR999','bce5e228c27e09db2e07949f5943d097f110c368')

var source = new bigml.Source(connection);

const BigML = {
  createModel: async function () {
    await mongodb.export2csv();
    await sleep(200);
      source.create('callDetails.csv', function(error, sourceInfo) {
          if (!error && sourceInfo) {
              const dataset = new bigml.Dataset(connection);
              dataset.create(sourceInfo, function(error, datasetInfo) {
                  if (!error && datasetInfo) {
                      var model = new bigml.Model(connection);
                      model.create(datasetInfo, function (error, modelInfo) {
                        if (!error && modelInfo) {
  
                          fs.writeFile("model.txt",modelInfo.object.resource,(err)=>{
                            if(err) return console.log(err);
                            console.log("Model created!");
                          })
                        }
                      });
                  }
              });
          }else{
            console.log(error);
          }
      })

    return "Model created!";
  },
  predict: async function (toPredict) {
    var prediction = new bigml.Prediction(connection);

    console.log("========== WHAT PREDICT: " + toPredict);
    fs.readFile('model.txt', 'utf8', function(err, data){
      prediction.create(data, toPredict ,function(error, prediction) { 
      
        var result = prediction.object.output + "";
        fs.writeFile('predict.txt', result, (err) => {
              if(err) return console.log(err);
              console.log(result); //Output of prediction
        });
      });
    });
  }
}

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}

module.exports = BigML