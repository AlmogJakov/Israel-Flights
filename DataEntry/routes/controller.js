const express = require("express");
const router = express.Router();
var API = require("../models/Flights");

// ------------------------------------ Log to file -------------------------------------
// source: https://stackoverflow.com/questions/41232578/node-js-console-log-in-txt-file
var log4js = require("log4js");
log4js.configure({
  appenders: {
    fileLog: { type: "file", filename: "logs/mylog.log" },
    console: { type: "console" },
  },
  categories: {
    file: { appenders: ["fileLog"], level: "error" },
    another: { appenders: ["console"], level: "trace" },
    default: { appenders: ["console", "fileLog"], level: "trace" },
  },
});
var logger = log4js.getLogger("fileLog");
//logger.debug("Cheese is not a food.");
// ---------------------------------- END Log to file -----------------------------------

// auto format code: https://blog.yogeshchavan.dev/automatically-format-code-on-file-save-in-visual-studio-code-using-prettier

// ----------------- Produce flights -----------------
const kafka = require("../models/produceKafka");
const produce = async () => {
  produce_func = async () => {};
};
API.Run();

// ----------------- Client -----------------
// Return current flight details to client via api
router.get("/", (req, res) => {
  res.send(API.getOutput());
});
module.exports = router;
