const express = require("express");
const dbConnection = require("../db.js"); // Make sure this path is correct
const searchRouter = express.Router();

// Search artists
searchRouter.get("/artists", (req, res) => {
  const searchTerm = req.query.q;
  const query = `
        SELECT * FROM artists WHERE name LIKE ?
    `;
  dbConnection.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

// Search albums with associated artists
searchRouter.get("/albums", (req, res) => {
  const searchTerm = req.query.q;
  const query = `
    SELECT 
      albums.*, 
      GROUP_CONCAT(artists.name ORDER BY artists.name SEPARATOR ', ') AS artistNames
    FROM 
      albums 
      LEFT JOIN artist_albums ON albums.id = artist_albums.album_id
      LEFT JOIN artists ON artist_albums.artist_id = artists.id
    WHERE 
      albums.title LIKE ?
    GROUP BY 
      albums.id;
  `;
  dbConnection.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});



// Search tracks with associated artists
searchRouter.get("/tracks", (req, res) => {
  const searchTerm = req.query.q;
  const query = `
    SELECT 
      tracks.*, 
      GROUP_CONCAT(artists.name ORDER BY artists.name SEPARATOR ', ') AS artistNames
    FROM 
      tracks 
      LEFT JOIN artist_tracks ON tracks.id = artist_tracks.track_id
      LEFT JOIN artists ON artist_tracks.artist_id = artists.id
    WHERE 
      tracks.trackName LIKE ?
    GROUP BY 
      tracks.id;
  `;
  dbConnection.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
    res.json(results);
  });
});


module.exports = searchRouter;


