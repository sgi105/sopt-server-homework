const express = require("express");
const router = express.Router();
const csv = require("csvtojson");
const path = require("path");
const absolutePath = __dirname + "/data.csv";
const {
  NO_USER,
  SAVE_FILE_FAIL,
  CREATED_USER
} = require("../../module/utils/responseMessage");
const { OK, NOT_FOUND, BAD_REQUEST } = require("../../module/utils/statusCode");
const crypto = require("crypto-promise");
const json2csv = require("json2csv");
const fs = require("fs");

// function to read csv from the file with matching studentNumber.
const readCsv = function(studentNumber) {
  return new Promise((resolve, reject) => {
    csv()
      .fromFile(absolutePath)
      .then(jsonObj => {
        if (jsonObj[0].studentNumber === studentNumber) {
          resolve(jsonObj[0]);
        } else reject(NO_USER);
      })
      .catch(err => console.log(err));
  });
};

router.get("/:id", (req, res) => {
  const id = req.params.id;
  readCsv(id)
    .then(studentData => res.status(OK).send(studentData))
    .catch(err => res.status(NOT_FOUND).send(err));
});

router.post("/", async (req, res) => {
  const studentData = req.body;
  // check if student name and student number are provided.
  if (!studentData.name || !studentData.studentNumber)
    return res.status(BAD_REQUEST).send(NULL_VALUE);

  // hash the student age with md5.
  const hashedAge = await crypto.hash("md5")(studentData.age);
  const hashedAgeString = hashedAge.toString("hex");

  studentData.age = hashedAgeString;

  // parse the input into csv without the header
  const resultCSV = json2csv.parse(studentData, { header: false });

  // csv 파일 저장 후 response 로 보내기
  // appendFile is used to add new students to the existing csv file.
  fs.appendFile(absolutePath, "\n" + resultCSV, err => {
    if (err) {
      res.status(DB_ERROR).send(SAVE_FILE_FAIL);
    } else {
      res.status(OK).send(CREATED_USER);
    }
  });
});

module.exports = router;
