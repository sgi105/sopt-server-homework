var express = require("express");
var router = express.Router();
const homework = require("./homework/index");

/* GET home page. */
router.use("/homework", homework);

module.exports = router;
