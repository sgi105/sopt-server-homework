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
  SAME_TITLE_EXISTS,
  DELETE_POST
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
  console.log(id);
  getPostById(absolutePath, id).then(post => res.status(OK).send(post));
});

router.post("/", (req, res) => {
  const post = req.body;

  post.time = moment().format("MMMM Do YYYY, h:mm:ss a");
  checkForSameTitle(absolutePath, post, res);
  hashPasswordAndAppend(post, res);
});

router.put("/:id", (req, res) => {
  getPostByIdAndUpdate(absolutePath, req.params.id, res);
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;

  getPostByIdAndDelete(absolutePath, id).then(posts =>
    AppendToDbAndSendResponse(absolutePath, posts, res, DELETE_POST)
  );
});

console.log(moment().format("MMMM Do YYYY, h:mm:ss a"));

function checkForSameTitle(filePath, newPost, res) {
  csv()
    .fromFile(filePath)
    .then(posts => {
      posts.forEach(post => {
        if (post.title == newPost.title)
          return res.status(BAD_REQUEST).send(SAME_TITLE_EXISTS);
      });
    })
    .catch(err => console.log(err));
}

function getPostById(filePath, id) {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(filePath)
      .then(posts => {
        console.log(posts);

        posts.forEach((post, index) => {
          if (post.id == id) resolve(post);
        });
      })
      .catch(err => console.log(err));
  });
}

function getPostByIdAndDelete(filePath, id) {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(filePath)
      .then(posts => {
        console.log(posts);
        let indexToDelete = undefined;
        posts.forEach((post, index) => {
          if (post.id == id) {
            indexToDelete = index;
          }
          posts.splice(indexToDelete, 1);
          console.log(posts);
          resolve(posts);
        });
      })
      .catch(err => console.log(err));
  });
}

function getPostByIdAndUpdate(filePath, id, res) {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(filePath)
      .then(posts => {
        console.log(posts);
        let indexToDelete = undefined;
        posts.forEach((post, index) => {
          if (post.id == id) {
            post = req.body;
            post.time = moment().format("MMMM Do YYYY, h:mm:ss a");
            checkForSameTitle(absolutePath, post, res);
            hashPasswordAndWrite(post, res);
          }
          resolve(posts);
        });
      })
      .catch(err => console.log(err));
  });
}

function hashPasswordAndAppend(post, res) {
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
            AppendToDbAndSendResponse(absolutePath, post, res, CREATED_POST);
          }
        }
      );
    }
  });
}

function hashPasswordAndWrite(post, res) {
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
            WriteToDbAndSendResponse(absolutePath, post, res, CREATED_POST);
          }
        }
      );
    }
  });
}

function AppendToDbAndSendResponse(filePath, data, res, message) {
  const resultCSV = json2csv.parse(data, { header: false });
  fs.appendFile(filePath, "\n" + resultCSV, err => {
    if (err) {
      res.status(DB_ERROR).send(SAVE_FILE_FAIL);
    } else {
      res.status(OK).send(message);
    }
  });
}

function WriteToDbAndSendResponse(filePath, data, res, message) {
  const resultCSV = json2csv.parse(data, { header: false });
  fs.writeFile(filePath, "\n" + resultCSV, err => {
    if (err) {
      res.status(DB_ERROR).send(SAVE_FILE_FAIL);
    } else {
      res.status(OK).send(message);
    }
  });
}

module.exports = router;
