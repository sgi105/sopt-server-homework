var express = require("express");
var router = express.Router();
const config = require("../../config/dbConfig");
const mysql = require("mysql");
const pool = mysql.createPool(config);
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { id, password } = req.body;

  // get the user data from DB by using the id

  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res.status(500).send(err.message);
      return console.log(err);
    }
    connection.query(
      "SELECT * FROM user WHERE id = ?",
      [id],
      async (err, result) => {
        if (err) {
          res.status(400).send(err.message);
          connection.release();
          return console.log(err);
        }
        if (!result[0]) {
          connection.release();
          return res.status(400).send("ID or Password incorrect.");
        }
        console.log(result[0]);

        const { password: dbPassword, salt } = result[0];

        const hashed = await bcrypt.hash(password, salt);

        if (hashed == dbPassword) res.status(200).send("Sign in Success");
        else res.status(400).send("ID or Password incorrect.");

        connection.release();
      }
    );
  });
});
module.exports = router;
