var express = require("express");
var router = express.Router();
const board = require("./board");

router.use("/board", board);

module.exports = router;
