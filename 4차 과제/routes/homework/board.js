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
  ID_OR_PW_NULL_VALUE,
  NO_RESULT_BOARD,
  GET_POST,
  CREATED_POST
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

router.get("/", async (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res
        .status(200)
        .send(successFalse(INTERNAL_SERVER_ERROR, CONNECTION_FAIL));
      return console.log(err);
    }

    // get all the boards
    connection.query(
      "SELECT title, content, writer, writetime, boardIdx FROM board",
      async (err, result) => {
        if (err) {
          connection.release();
          res
            .status(200)
            .send(successFalse(INTERNAL_SERVER_ERROR, CONNECTION_FAIL));
          return console.log(err);
        }

        // if there is no board, send error message
        if (!result[0]) {
          connection.release();
          return res.status(200).send(successFalse(NOT_FOUND, NO_RESULT_BOARD));
        }

        res.status(200).send(successTrue(OK, GET_POST, result));

        connection.release();
      }
    );
  });
});

router.get("/:idx", async (req, res) => {
  const idx = req.params.idx;
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res
        .status(200)
        .send(successFalse(INTERNAL_SERVER_ERROR, CONNECTION_FAIL));
      return console.log(err);
    }

    // get the board with the given idx
    connection.query(
      "SELECT title, content, writer, writetime, boardIdx FROM board WHERE boardIdx = ?",
      [idx],
      async (err, result) => {
        if (err) {
          console.log(err);
          connection.release();
          return res.status(200).send(successFalse(BAD_REQUEST, QUERY_FAIL));
        }

        // if there is no board, send error message
        if (!result[0]) {
          connection.release();
          return res.status(200).send(successFalse(NOT_FOUND, NO_RESULT_BOARD));
        }
        res.status(200).send(successTrue(OK, GET_POST, result));

        connection.release();
      }
    );
  });
});

router.post("/", async (req, res) => {
  const { title, content, boardPw, writer } = req.body;

  const salt = await bcrypt.genSalt(10);
  const hashed = await bcrypt.hash(boardPw, salt);

  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res
        .status(200)
        .send(successFalse(INTERNAL_SERVER_ERROR, CONNECTION_FAIL));
      return console.log(err);
    }
    connection.query(
      "INSERT INTO board(writer, title, content, boardPw, salt) VALUES (?,?,?,?,?)",
      [writer, title, content, hashed, salt],
      (err, result) => {
        if (err) {
          if (err.code === "ER_BAD_NULL_ERROR") {
            res.status(200).send(successFalse(BAD_REQUEST, NULL_VALUE));
          } else {
            res.status(200).send(successFalse(BAD_REQUEST, QUERY_FAIL));
          }
          connection.release();
          return console.log(err);
        }
        connection.release();
        console.log(result);
        res
          .status(200)
          .send(
            successTrue(CREATED, CREATED_POST, { boardIdx: result.insertId })
          );
      }
    );
  });
});

router.delete("/", async (req, res) => {
  const idx = parseInt(req.body.boardIdx);

  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res.status(500).send(err.message);
      return console.log(err);
    }

    // get all the boards
    connection.query(
      "DELETE FROM board WHERE boardIdx = ?",
      [idx],
      async (err, result) => {
        if (err) {
          res.status(400).send(err.message);
          connection.release();
          return console.log(err);
        }

        // if there is no board, send error message
        if (!result.affectedRows) {
          connection.release();
          return res.status(400).send(`No board with idx of ${idx} existing.`);
        }

        res.status(200).send(`Board with idx of ${idx} deleted.`);

        connection.release();
      }
    );
  });
});

module.exports = router;
