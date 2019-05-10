var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

router.use("/training", require("./training/index"));
router.use("/homework", require("./homework/index"));

module.exports = router;
