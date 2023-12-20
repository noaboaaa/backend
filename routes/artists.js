const express = require("express");
const artistsRouter = express.Router();
const dbConnection = require("../db.js"); // Make sure this is the correct path

// GET Endpoint "/artists" - Get All Artists
artistsRouter.get("/", (request, response) => {
  const queryString = "SELECT * FROM artists ORDER BY name;";
  dbConnection.query(queryString, (error, results) => {
    if (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
    response.json(results);
  });
});

// GET Endpoint "/artists/search" - Search for Artists and their related albums and tracks
artistsRouter.get("/search", (request, response) => {
  const searchTerm = request.query.q;
  const artistQueryString = "SELECT * FROM artists WHERE name LIKE ? ORDER BY name;";
  const artistValues = [`%${searchTerm}%`];

  dbConnection.query(artistQueryString, artistValues, (error, artists) => {
    if (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }

    let completedArtistCount = 0;
    if (artists.length === 0) {
      return response.json([]); // Return an empty array if no artists found
    }

    artists.forEach((artist, index) => {
      // Fetch albums for each artist
      const albumQueryString = "SELECT * FROM albums JOIN artist_albums ON albums.id = artist_albums.album_id WHERE artist_albums.artist_id = ?;";
      dbConnection.query(albumQueryString, [artist.id], (albumError, albumResults) => {
        if (albumError) {
          return response.status(500).json({ error: "Internal Server Error" });
        }

        artists[index].albums = albumResults;

        // Fetch tracks for each artist
        const trackQueryString = "SELECT * FROM tracks JOIN artist_tracks ON tracks.id = artist_tracks.track_id WHERE artist_tracks.artist_id = ?;";
        dbConnection.query(trackQueryString, [artist.id], (trackError, trackResults) => {
          if (trackError) {
            return response.status(500).json({ error: "Internal Server Error" });
          }

          artists[index].tracks = trackResults;

          completedArtistCount++;
          if (completedArtistCount === artists.length) {
            response.json(artists);
          }
        });
      });
    });
  });
});

// GET Endpoint "/artists/:id" - Get One Artist
artistsRouter.get("/:id", (request, response) => {
  const id = request.params.id;
  const queryString = "SELECT * FROM artists WHERE id = ?;";
  dbConnection.query(queryString, [id], (error, results) => {
    if (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
    if (results.length === 0) {
      return response.status(404).json({ message: "Artist not found" });
    }
    response.json(results[0]);
  });
});

// GET Endpoint "/artists/:id/albums" - Get Albums by an Artist
artistsRouter.get("/:id/albums", (request, response) => {
  const id = request.params.id;
  const queryString = "SELECT * FROM albums JOIN artist_albums ON albums.id = artist_albums.album_id WHERE artist_albums.artist_id = ?;";
  dbConnection.query(queryString, [id], (error, results) => {
    if (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
    response.json(results);
  });
});

// GET Endpoint "/artists/:id/tracks" - Get Tracks by an Artist
artistsRouter.get("/:id/tracks", (request, response) => {
  const id = request.params.id;
  const queryString = "SELECT * FROM tracks JOIN artist_tracks ON tracks.id = artist_tracks.track_id WHERE artist_tracks.artist_id = ?;";
  dbConnection.query(queryString, [id], (error, results) => {
    if (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
    response.json(results);
  });
});

// POST Endpoint to create a new artist
artistsRouter.post("/", (request, response) => {
  const { name, imageUrl } = request.body;
  const queryString = "INSERT INTO artists (name, imageUrl) VALUES (?, ?);";
  dbConnection.query(queryString, [name, imageUrl], (error, results) => {
    if (error) {
      return response.status(500).json({ error: "Internal Server Error" });
    }
    response.status(201).json({
      message: "Artist created successfully",
      artistId: results.insertId,
    });
  });
});

module.exports = artistsRouter;
