const express = require("express");
const router = express.Router();
module.exports = router;

router.get("/", (req, res) => {
  res.render("index");
});

// Include static files (styles, images etc)
router.use("/", express.static("./views/static"));
