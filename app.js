// ========== IMPORTS ========== //
import express from "express";
import cors from "cors";
import dbConnection from "./db-connect.js";
import artistsRouter from "./routes/artist.js";
import albumsRouter from "./routes/album.js";
import songsRouter from "./routes/track.js";

// ========== APP SETUP ========== //
const app = express();
const port = process.env.SERVER_PORT || 4000;
app.use(express.json()); // to parse JSON bodies
app.use(cors());
// Routers
app.use("/artists", artistsRouter);
app.use("/albums", albumsRouter);
app.use("/songs", songsRouter);

// GET Endpoint "/"
app.get("/", (request, response) => {
    response.send("Node Express Musicbase REST API");
});

app.listen(port, () => {
    console.log(`App listening on http://localhost:${port}`);
});

/*import express from "express";
import cors from "cors";
import mysql from "mysql2";
import "dotenv/config";
import path from "path";
import fs from "fs";
const __dirname = path.dirname(fileURLToPath(import.meta.url));


const app = express();
app.use(express.json());
app.use(cors());

const dbconfig = {
  host: process.env.MYSQL_HOST,
  database: process.env.MYSQL_DATABASE,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
};

if (process.env.MYSQL_CERT) {
  dbconfig.ssl = {
    ca: fs.readFileSync(process.env.MYSQL_CERT).toString(),
  };
}

const connection = mysql.createConnection(dbconfig);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/nkrdata", (req, res) => {
  connection.query(`SELECT * FROM testnames`, function (err, results, fields) {
    res.json(results);
  });
});

app.get("/albums", (req, res) => {
  connection.query("SELECT * FROM Album", (err, results) => {
    if (err) {
      console.error("Error fetching albums: " + err.message);
      res.status(500).send("Error fetching albums");
      return;
    }
    res.json(results);
  });
});

const port = process.env.PORT || 4000;
app.listen(port, () =>
  console.log(`Server running on http://localhost:${port}`)
);*/
