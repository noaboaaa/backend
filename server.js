const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const artistsRouter = require("./artists");
const albumsRouter = require("./albums");
const tracksRouter = require("./tracks");
const searchRouter = require("./search"); // Ensure this file exists and is correctly set up

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(express.json()); // Middleware to parse JSON bodies
app.use(cors()); // Enable CORS

// Set up routes
app.use("/artists", artistsRouter);
app.use("/albums", albumsRouter);
app.use("/tracks", tracksRouter);
app.use("/search", searchRouter); // Include only if you have this route

// Server start listening
app.listen(port, () => {
  console.log(`Musicbase is running on http://localhost:${port}`);
});

// Default route
app.get("/", (req, res) => {
  res.send("Musicbase is up and running");
});
