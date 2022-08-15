const express = require("express");
const router = express.Router();
var API = require("../models/API");

// ----------------- Client -----------------
// Return current flight details to the client via api
router.get("/", (req, res) => {
  res.send(API.getOutput());
});

module.exports = router;
