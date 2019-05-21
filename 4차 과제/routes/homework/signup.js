var express = require("express");
var router = express.Router();
const config = require("../../config/dbConfig");
const mysql = require("mysql");
const pool = mysql.createPool(config);
const bcrypt = require("bcrypt");
const {
  CONNECTION_FAIL,
  QUERY_FAIL,
  CREATED_USER,
  ALREADY_USER,
  NULL_VALUE
} = require("../../module/responseMessage");
const { successTrue, successFalse } = require("../../module/utils");
const {
  OK,
  BAD_REQUEST,
  CREATED,
  NOT_FOUND,
  INTERNAL_SERVER_ERROR,
  DB_ERROR
} = require("../../module/statusCode");

router.post("/", async (req, res) => {
  const user = req.body;
  const { id, name, password } = user;
  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(password, salt);

  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res
        .status(200)
        .send(successFalse(INTERNAL_SERVER_ERROR, CONNECTION_FAIL));
      return console.log(err);
    }
    connection.query(
      "INSERT INTO user(id, name, password, salt) VALUES (?,?,?,?)",
      [id, name, hashed, salt],
      (err, result) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") {
            res.status(200).send(successFalse(BAD_REQUEST, ALREADY_USER));
          } else {
            res.status(200).send(successFalse(BAD_REQUEST, NULL_VALUE));
          }
          connection.release();
          return console.log(err.code);
        }
        // get userIdx from DB
        console.log(result);

        connection.release();
        res
          .status(200)
          .send(
            successTrue(CREATED, CREATED_USER, { userIdx: result.insertId })
          );
      }
    );
  });
});

module.exports = router;
