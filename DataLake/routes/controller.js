const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  //(URL || Path , Call back function)
  res.render("index");
});

router.use("/", express.static("./views/static"));

module.exports = router;
