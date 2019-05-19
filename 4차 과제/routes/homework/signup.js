var express = require("express");
var router = express.Router();
const config = require("../../config/dbConfig");
const mysql = require("mysql");
const pool = mysql.createPool(config);
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const user = req.body;
  const { id, name, password } = user;
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);
  const userData = [[id, name, hashed, salt]];
  console.log(userData);
  console.log(user);

  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res.status(500).send(err.message);
      return console.log(err);
    }
    connection.query(
      "INSERT INTO user(id, name, password, salt) VALUES (?,?,?,?)",
      [id, name, hashed, salt],
      (err, result) => {
        if (err) {
          res.status(400).send(err.message);
          connection.release();
          return console.log(err);
        }
        connection.release();
        res.status(200).send("Sign up Success");
      }
    );
  });
});

module.exports = router;
