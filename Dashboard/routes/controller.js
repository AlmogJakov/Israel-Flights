const express = require("express");
const router = express.Router();
module.exports = router;

router.get("/", (req, res) => {
  res.render("index");
});

// where style files will be
router.use("/", express.static("./views"));
