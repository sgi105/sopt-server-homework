const mysql = require("mysql");
var express = require("express");
var router = express.Router();
const config = require("../config/dbConfig");
const pool = mysql.createPool(config);

/* GET home page. */
router.get("/:gender", (req, res) => {
  console.log("fired");
  const gender = req.params.gender;
  const selectWomenQuery = "SELECT * FROM membership WHERE gender = ?";

  pool.getConnection((err, connection) => {
    connection.query(selectWomenQuery, [gender], (err, result) => {
      if (err) {
      } else {
        console.log(result);
        connection.release();
      }
    });
  });
});

module.exports = router;
