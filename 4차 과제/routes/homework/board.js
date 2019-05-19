var express = require("express");
var router = express.Router();
const config = require("../../config/dbConfig");
const mysql = require("mysql");
const pool = mysql.createPool(config);
const bcrypt = require("bcrypt");

router.get("/", async (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      connection.release();
      res.status(500).send(err.message);
      return console.log(err);
    }

    // get all the boards
    connection.query(
      "SELECT title, content, writer, writetime FROM board",
      async (err, result) => {
        if (err) {
          res.status(400).send(err.message);
          connection.release();
          return console.log(err);
        }

        // if there is no board, send error message
        if (!result[0]) {
          connection.release();
          return res.status(400).send("No board existing.");
        }

        res.status(200).send(result);

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
      res.status(500).send(err.message);
      return console.log(err);
    }

    // get all the boards
    connection.query(
      "SELECT title, content, writer, writetime FROM board WHERE boardIdx = ?",
      [idx],
      async (err, result) => {
        if (err) {
          res.status(400).send(err.message);
          connection.release();
          return console.log(err);
        }

        // if there is no board, send error message
        if (!result[0]) {
          connection.release();
          return res.status(400).send(`No board with idx of ${idx} existing.`);
        }
        res.status(200).send(result);

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
      res.status(500).send(err.message);
      return console.log(err);
    }
    connection.query(
      "INSERT INTO board(writer, title, content, boardPw, salt) VALUES (?,?,?,?,?)",
      [writer, title, content, hashed, salt],
      (err, result) => {
        if (err) {
          res.status(400).send(err.message);
          connection.release();
          return console.log(err);
        }
        connection.release();
        console.log(result);
        res.status(200).send("Board creation Success");
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
