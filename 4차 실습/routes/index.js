var express = require("express");
var router = express.Router();
let membership = require("./membership");
/* GET home page. */
router.use("/membership", membership);

module.exports = router;
