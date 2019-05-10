const json2csv = require("json2csv");
const csvtojson = require("csvtojson");
const fs = require("fs");
const filePath = __dirname + "/test.csv";

const data1 = {
  age: 25,
  name: "Justin"
};

const data2 = {
  name: "Sally",
  age: 21,
  school: "abcs"
};

const data3 = { age: 22, name: "Alex" };

const fields = ["age", "name", "school"];
const opts = { fields };

// console.log(json2csv.parse([data1, data2], opts));
const db = json2csv.parse([data1, data2, data3], opts);

(async () => {
  await fs.appendFile(filePath, db, err => {
    if (err) throw err;
  });
})();

async function saveNewData(filePath, data) {
  const json = await csvtojson().fromFile(filePath);
  // console.log(json);
  json.push(data);
  // console.log(json);
  let db = json2csv.parse(json, opts);
  // console.log(db);
  await fs.writeFile(filePath, db, err => {
    if (err) throw err;
  });
}

(async () => {
  await saveNewData(filePath, { name: "alice", age: 20 });
  await saveNewData(filePath, { name: "coonner", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
  await saveNewData(filePath, { name: "coonner", age: 20 });
  await saveNewData(filePath, { name: "coonner", age: 20 });
  await saveNewData(filePath, { name: "coonner", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
  await saveNewData(filePath, { name: "coonner", age: 20 });
  await saveNewData(filePath, { name: "coonner", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
  await saveNewData(filePath, { name: "chris", age: 20 });
})();

// console.log(getDb(filePath));

// const json = await csvtojson().fromFile(filePath);
