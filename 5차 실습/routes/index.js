var express = require("express");
var router = express.Router();

/* GET home page. */
router.use("/training", require("./training/index"));

module.exports = router;
