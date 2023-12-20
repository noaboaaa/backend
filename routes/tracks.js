const express = require("express");
const tracksRouter = express.Router();
const dbConnection = require("../db"); // Adjust the path as necessary

tracksRouter.get("/", (request, response) => {
  const queryString = `
    SELECT 
        t.id, 
        t.trackName, 
        t.duration, 
        GROUP_CONCAT(DISTINCT a.name SEPARATOR ', ') AS artistNames
    FROM 
        tracks t
    LEFT JOIN 
        artist_tracks at ON t.id = at.track_id
    LEFT JOIN 
        artists a ON at.artist_id = a.id
    GROUP BY 
        t.id;
  `;

  dbConnection.query(queryString, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response.json(results);
    }
  });
});


//GET Endpoint "/tracks/:id" - Get One Track
tracksRouter.get("/:id", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
    SELECT t.*, GROUP_CONCAT(a.name SEPARATOR ', ') AS artistNames
    FROM tracks t
    LEFT JOIN artist_tracks at ON t.id = at.track_id
    LEFT JOIN artists a ON at.artist_id = a.id
    WHERE t.id = ?
    GROUP BY t.id;
  `;
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "Track not found" });
    } else {
      response.json(results[0]);
    }
  });
});

//GET Endpoint "/tracks/:id/albums" - Get All Albums for a Specific Track
tracksRouter.get("/:id/albums", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
    SELECT a.*, at.track_position
    FROM albums a
    JOIN album_tracks at ON a.id = at.album_id
    WHERE at.track_id = ?
    ORDER BY at.track_position;
  `;
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "No albums found for this track" });
    } else {
      response.json(results);
    }
  });
});


// POST Endpoint to create a new track
tracksRouter.post("/", (request, response) => {
  const { trackName, duration } = request.body;

  const queryString = /*sql*/ `
    INSERT INTO tracks (trackName, duration) VALUES (?, ?);
  `;
  const values = [trackName, duration];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response.status(201).json({
        message: "Track created successfully",
        trackId: results.insertId,
      });
    }
  });
});

module.exports = tracksRouter;
