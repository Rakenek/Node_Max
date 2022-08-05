const mongodb = require("mongodb");
const MONGO_PASS = require("../SECRET");

const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    `mongodb+srv://raken:${MONGO_PASS}@cluster0.t7o7cnp.mongodb.net/shop?retryWrites=true&w=majority`
  )
    .then((client) => {
      console.log("connected to db");
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log(err);
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }
  throw "No database found!";
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
