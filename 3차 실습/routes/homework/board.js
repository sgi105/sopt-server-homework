var express = require("express");
var router = express.Router();
const moment = require("moment");
const crypto = require("crypto");
const json2csv = require("json2csv");
const csv = require("csvtojson");
const fs = require("fs");

const {
  NO_USER,
  SAVE_FILE_FAIL,
  CREATED_USER,
  CREATED_POST,
  SAME_TITLE_EXISTS
} = require("../../module/utils/responseMessage");
const {
  OK,
  NOT_FOUND,
  BAD_REQUEST,
  DB_ERROR
} = require("../../module/utils/statusCode");
const absolutePath = __dirname + "/data.csv";

router.get("/:id", (req, res) => {
  const id = req.params.id;
});

router.post("/", async (req, res) => {
  const post = req.body;

  post.time = moment().format("MMMM Do YYYY, h:mm:ss a");
  checkForSameTitle(absolutePath, post);
  hashPasswordAndSave(post, res);
});

router.put("/", (req, res) => {});

router.delete("/", (req, res) => {});

console.log(moment().format("MMMM Do YYYY, h:mm:ss a"));
module.exports = router;

const checkForSameTitle = function(filePath, newPost) {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(filePath)
      .then(posts => {
        posts.forEach(post => {
          if (post.title === newPost.title)
            req.status(BAD_REQUEST).send(SAME_TITLE_EXISTS);
        });
      })
      .catch(err => console.log(err));
  });
};

function hashPasswordAndSave(post, res) {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      res.status(DB_ERROR).send(err);
    } else {
      //   생성된 randomByte를 salt로 사용하여 password hashing하기
      crypto.pbkdf2(
        post.password,
        buffer.toString("base64"),
        10000,
        64,
        "sha512",
        (err, hashed) => {
          if (err) {
            res.status(DB_ERROR).send(err);
          } else {
            // 정상적으로 hashing이 완료되면 message, hashedPassword, salt를 userData에 저장
            post.hashedPassword = hashed.toString("base64");
            post.salt = buffer.toString("base64");
            writeToDbAndSendRespose(absolutePath, post, res, CREATED_POST);
          }
        }
      );
    }
  });
}

function writeToDbAndSendRespose(filePath, data, res, message) {
  const resultCSV = json2csv.parse(data, { header: false });
  fs.appendFile(filePath, "\n" + resultCSV, err => {
    if (err) {
      res.status(DB_ERROR).send(SAVE_FILE_FAIL);
    } else {
      res.status(OK).send(message);
    }
  });
}
