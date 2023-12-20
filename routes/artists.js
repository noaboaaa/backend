const express = require("express");
const artistsRouter = express.Router();
const dbConnection = require("../db.js"); // Update with the correct path to your db.js

artistsRouter.get("/", (request, response) => {

  const queryString = `SELECT * FROM artists ORDER BY name;`;

  dbConnection.query(queryString, async (error, artists) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
      return;
    }

    try {
      const artistsWithDetails = await Promise.all(
        artists.map(async (artist) => {
          // Fetch albums for each artist
          const albumQueryString = `
          SELECT albums.* 
          FROM albums 
          JOIN artist_albums ON albums.id = artist_albums.album_id 
          WHERE artist_albums.artist_id = ?;
        `;
          const albumResults = await dbConnection
            .promise()
            .query(albumQueryString, [artist.id]);

          // Fetch tracks for each artist
          const trackQueryString = `
          SELECT tracks.* 
          FROM tracks 
          JOIN artist_tracks ON tracks.id = artist_tracks.track_id 
          WHERE artist_tracks.artist_id = ?;
        `;
          const trackResults = await dbConnection
            .promise()
            .query(trackQueryString, [artist.id]);

          return {
            ...artist,
            albums: albumResults[0],
            tracks: trackResults[0],
          };
        })
      );

      response.json(artistsWithDetails);
    } catch (queryError) {
      response.status(500).json({ error: "Internal Server Error" });
    }
  });
});



//GET Endpoint "/artists/search" - Search for Artists and their related albums and tracks
artistsRouter.get("/search", (request, response) => {
  const query = request.query.q;
  const artistQueryString = `
    SELECT * FROM artists WHERE name LIKE ? ORDER BY name;
  `;
  const artistValues = [`%${query}%`];

  dbConnection.query(artistQueryString, artistValues, (error, artists) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
      return;
    }

    // Now fetch albums and tracks for each artist
    const artistsWithDetails = artists.map(async (artist) => {
      // Fetch albums
      const albumQueryString = `
        SELECT albums.* FROM albums 
        JOIN artist_albums ON albums.id = artist_albums.album_id 
        WHERE artist_albums.artist_id = ?;
      `;
      const albumResults = await dbConnection.promise().query(albumQueryString, [artist.id]);
      
      // Fetch tracks
      const trackQueryString = `
        SELECT tracks.* FROM tracks 
        JOIN artist_tracks ON tracks.id = artist_tracks.track_id 
        WHERE artist_tracks.artist_id = ?;
      `;
      const trackResults = await dbConnection.promise().query(trackQueryString, [artist.id]);

      return {
        ...artist,
        albums: albumResults[0],
        tracks: trackResults[0]
      };
    });

    Promise.all(artistsWithDetails).then(completed => {
      
      response.json(completed);
    });
  });
});



//GET Endpoint "/artists/:id" - Get One Artist
artistsRouter.get("/:id", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
    SELECT * FROM artists WHERE id = ?;
  `;
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "Artist not found" });
    } else {
      response.json(results[0]);
    }
  });
});

//GET Endpoint "/artists/:id/albums" - Get Albums by an Artist
artistsRouter.get("/:id/albums", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
    SELECT albums.*
    FROM albums
    JOIN artist_albums ON albums.id = artist_albums.album_id
    WHERE artist_albums.artist_id = ?;
  `;
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "No albums found for this artist" });
    } else {
      response.json(results);
    }
  });
});

// POST Endpoint to create a new artist
artistsRouter.post("/", (request, response) => {
  const { name, imageUrl } = request.body;

  const queryString = /*sql*/ `
    INSERT INTO artists (name, imageUrl) VALUES (?, ?);
  `;
  const values = [name, imageUrl];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response
        .status(201)
        .json({
          message: "Artist created successfully",
          artistId: results.insertId,
        });
    }
  });
});

//GET Endpoint "/artists/:artistId/tracks" - Get All Tracks by a Specific Artist
artistsRouter.get("/:artistId/tracks", (request, response) => {
  const artistId = request.params.artistId;
  const queryString = /*sql*/ `
    SELECT t.*, at.track_position
    FROM tracks t
    JOIN artist_tracks at ON t.id = at.track_id
    WHERE at.artist_id = ?
    ORDER BY at.track_position;
  `;
  const values = [artistId];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else if (results.length === 0) {
      response.status(404).json({ message: "No tracks found for this artist" });
    } else {
      response.json(results);
    }
  });
});

module.exports = artistsRouter;
