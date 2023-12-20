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

// Search albums
searchRouter.get("/albums", (req, res) => {
  const searchTerm = req.query.q;
  const query = `
        SELECT * FROM albums WHERE title LIKE ?
    `;
  dbConnection.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});


// Search tracks
searchRouter.get("/tracks", (req, res) => {
  const searchTerm = req.query.q;
  const query = `
        SELECT * FROM tracks WHERE trackName LIKE ?
    `;
  dbConnection.query(query, [`%${searchTerm}%`], (error, results) => {
    if (error) {
      res.status(500).json({ error: "Internal Server Error" });
    } else {
      res.json(results);
    }
  });
});

module.exports = searchRouter;


