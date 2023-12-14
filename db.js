const mysql = require("mysql");
const fs = require("fs");
require("dotenv").config();

const dbConnection = {
  host: process.env.MYSQL_HOST,
  port: process.env.MYSQL_PORT,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  multipleStatements: true, // Be cautious with this in a production environment
};

// SSL configuration
if (process.env.MYSQL_CERT) {
  dbConnection.ssl = {
    ca: fs.readFileSync("DigiCertGlobalRootCA.crt.pem"),
  };
}

const connection = mysql.createConnection(dbConnection);

module.exports = connection;
