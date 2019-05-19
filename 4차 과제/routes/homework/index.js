var express = require("express");
var router = express.Router();
const signup = require("./signup");
const signin = require("./signin");
const board = require("./board");

/* GET home page. */
router.use("/signup", signup);
router.use("/signin", signin);
router.use("/board", board);

module.exports = router;
