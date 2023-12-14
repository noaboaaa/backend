import { Router } from "express";
import dbConnection from "../db-connect.js";

const songsRouter = Router();

// GET Endpoint "/songs" - get all songs
songsRouter.get("/", (request, response) => {
  const queryString = /*sql*/ `
            SELECT songs.*,
                    artists.name AS artistName,
                    artists.id AS artistId,
                    artists.genre AS artistGenre
            FROM songs
            INNER JOIN artists_songs ON songs.id = artists_songs.song_id
            INNER JOIN artists ON artists_songs.artist_id = artists.id;    
    
    `;

  dbConnection.query(queryString, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// GET Endpoint "/songs/:id" - get one song
songsRouter.get("/:id", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
            SELECT songs.*,
                    artists.name AS artistName,
                    artists.id AS artistId,
                    artists.genre AS artistGenre
            FROM songs
            INNER JOIN artists_songs ON songs.id = artists_songs.song_id
            INNER JOIN artists ON artists_songs.artist_id = artists.id  
            WHERE songs.id = ?;`; // sql query
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results[0]);
    }
  });
});

export default songsRouter;
