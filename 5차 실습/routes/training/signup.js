var express = require("express");
var router = express.Router();
const upload = require("../../config/multer");
const config = require("../../config/dbConfig");
const mysql = require("mysql");
const pool = mysql.createPool(config);

/* GET home page. */

router.post("/", upload.single("img"), (req, res) => {
  const { id, name, password } = req.body;
  const profileImg = req.file.location;
  //   console.log(img);
  const data = { id, name, profileImg, password };
  const query = `INSERT INTO user (id, name, profileImg, password) VALUES ('${id}', ${name}, ${profileImg}, ${password})`;
  console.log(query);
  console.log(data);

  pool.getConnection((err, connection) => {
    if (err) return console.log(err);
    connection.query(query, (err, result) => {
      if (err) {
        return console.log(err);
      } else {
        console.log(result);
        connection.release();
      }
    });
  });
});

module.exports = router;
