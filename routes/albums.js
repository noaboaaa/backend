const express = require("express");
const albumsRouter = express.Router();
const dbConnection = require("../db.js"); // Update with the correct path to your db.js


// GET Endpoint "/albums" - Get All Albums along with their artist names
albumsRouter.get("/", (request, response) => {
  const queryString = `
    SELECT 
        alb.id, 
        alb.title, 
        alb.releaseYear, 
        alb.coverImageUrl, 
        GROUP_CONCAT(art.name ORDER BY art.name SEPARATOR ', ') AS artistNames
    FROM 
        albums alb
    LEFT JOIN 
        artist_albums aa ON alb.id = aa.album_id
    LEFT JOIN 
        artists art ON aa.artist_id = art.id
    GROUP BY 
        alb.id;
  `;

  dbConnection.query(queryString, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response.json(results);
    }
  });
});

// Search for Albums and their related artists and tracks
albumsRouter.get("/search", (req, res) => {
  const searchTerm = req.query.q;
  const albumQueryString = `
    SELECT * FROM albums WHERE title LIKE ? ORDER BY title;
  `;
  const albumValues = [`%${searchTerm}%`];

  dbConnection.query(albumQueryString, albumValues, (error, albums) => {
    if (error) {
      return res.status(500).json({ error: "Internal Server Error" });
    }

    let completedAlbumCount = 0;
    if (albums.length === 0) {
      return res.json([]); // Return an empty array if no albums found
    }

    albums.forEach((album, index) => {
      // Fetch artists for each album
      const artistQueryString = `
        SELECT artists.* FROM artists
        JOIN artist_albums ON artists.id = artist_albums.artist_id
        WHERE artist_albums.album_id = ?;
      `;
      dbConnection.query(artistQueryString, [album.id], (artistError, artistResults) => {
        if (artistError) {
          return res.status(500).json({ error: "Internal Server Error" });
        }
        albums[index].artists = artistResults;

        // Fetch tracks for each album
        const trackQueryString = `
          SELECT tracks.* FROM tracks
          JOIN album_tracks ON tracks.id = album_tracks.track_id
          WHERE album_tracks.album_id = ?;
        `;
        dbConnection.query(trackQueryString, [album.id], (trackError, trackResults) => {
          if (trackError) {
            return res.status(500).json({ error: "Internal Server Error" });
          }

          albums[index].tracks = trackResults;

          completedAlbumCount++;
          if (completedAlbumCount === albums.length) {
            res.json(albums);
          }
        });
      });
    });
  });
});


//GET Endpoint "/albums/:id" - Get Specific Album with Tracks
albumsRouter.get("/:id", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
    SELECT a.*, at.track_position, t.id AS trackId, t.trackName, t.duration
    FROM albums a
    LEFT JOIN album_tracks at ON a.id = at.album_id
    LEFT JOIN tracks t ON at.track_id = t.id
    WHERE a.id = ?
    ORDER BY at.track_position;
  `;
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "No album found" });
    } else {
      response.json(results);
    }
  });
});

//GET Endpoint "/albums/:id/tracks" - Get All Tracks from a Specific Album
albumsRouter.get("/:id/tracks", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
    SELECT t.*, at.track_position
    FROM album_tracks at
    JOIN tracks t ON at.track_id = t.id
    WHERE at.album_id = ?
    ORDER BY at.track_position;
  `;
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "No tracks found for this album" });
    } else {
      response.json(results);
    }
  });
});

// POST Endpoint to create a new album
albumsRouter.post("/", (request, response) => {
  const { title, releaseYear, coverImageUrl } = request.body;

  const queryString = /*sql*/ `
    INSERT INTO albums (title, releaseYear, coverImageUrl) VALUES (?, ?, ?);
  `;
  const values = [title, releaseYear, coverImageUrl];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response
        .status(201)
        .json({
          message: "Album created successfully",
          albumId: results.insertId,
        });
    }
  });
});


module.exports = albumsRouter;
