const { getDb } = require("../util/database");
const { ObjectId } = require("mongodb");

class User {
  constructor(username, email, id) {
    this.name = username;
    this.email = email;
    this._id = id ? new ObjectId(id) : null;
  }

  save() {
    const db = getDb();
    return db.collection("users").insertOne(this);
  }

  static findById(userId) {
    const db = getDb();
    const userIdObject = new ObjectId(userId);
    return db.collection("users").findOne({ _id: userIdObject });
  }
}

module.exports = User;
