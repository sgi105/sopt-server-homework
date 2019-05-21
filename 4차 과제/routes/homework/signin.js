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
  NULL_VALUE,
  LOGIN_SUCCESS,
  WRONG_ID_OR_PASSWORD,
  ID_OR_PW_NULL_VALUE
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
  const { id, password } = req.body;

  // if id or password is null, return error message
  if (!id || !password) {
    return res.status(200).send(successFalse(BAD_REQUEST, ID_OR_PW_NULL_VALUE));
  }

  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res
        .status(200)
        .send(successFalse(INTERNAL_SERVER_ERROR, CONNECTION_FAIL));
      return console.log(err);
    }

    // get the user data from DB by using the id
    connection.query(
      "SELECT * FROM user WHERE id = ?",
      [id],
      async (err, result) => {
        if (err) {
          console.log(err);
          connection.release();
          return res.status(200).send(successFalse(BAD_REQUEST, QUERY_FAIL));
        }

        // if there is no user with the id, send error message
        if (!result[0]) {
          connection.release();
          return res
            .status(200)
            .send(successFalse(BAD_REQUEST, WRONG_ID_OR_PASSWORD));
        }
        const { password: dbPassword, salt } = result[0];

        const hashed = await bcrypt.hash(password, salt);

        // check if the password is correct
        if (hashed == dbPassword)
          res
            .status(200)
            .send(
              successTrue(OK, LOGIN_SUCCESS, { userIdx: result[0].userIdx })
            );
        else
          res.status(200).send(successFalse(BAD_REQUEST, WRONG_ID_OR_PASSWORD));

        connection.release();
      }
    );
  });
});
module.exports = router;
