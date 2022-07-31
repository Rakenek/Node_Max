const Sequelize = require("sequelize");

const sequelize = new Sequelize("mydatabase", "root", "database", {
  dialect: "mysql",
  host: "127.0.0.1",
});

module.exports = sequelize;

// const mysql = require("mysql2");

// const pool = mysql.createPool({
//   host: "127.0.0.1",
//   port: "3306",
//   user: "root",
//   password: "database",
//   database: "mydatabase",
// });

// module.exports = pool.promise();
