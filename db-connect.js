import mysql from "mysql2"; // using mysql2 - installed npm library
import "dotenv/config";

// using the variables from the .env file
// and creates the connection to database
const dbConnection = mysql.createConnection({
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  multipleStatements: true,
});

// exports database connection
export default dbConnection;
