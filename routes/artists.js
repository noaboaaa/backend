import { Router } from "express";
import dbConnection from "../db-connect.js";

const artistsRouter = Router();

// GET Endpoint "/artists" - get all artists
artistsRouter.get("/", (request, response) => {
  const queryString = /*sql*/ `
    SELECT * 
    FROM artists ORDER BY name;`;

  dbConnection.query(queryString, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// GET Endpoint "/artists/search?q=taylor" - get all artists
// Ex: http://localhost:3333/artists/search?q=cy
artistsRouter.get("/search", (request, response) => {
  const query = request.query.q;
  const queryString = /*sql*/ `
    SELECT * 
    FROM artists
    WHERE name LIKE ?
    ORDER BY name`;
  const values = [`%${query}%`];
  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// GET Endpoint "/artists/:id" - get one artist
artistsRouter.get("/:id", (request, response) => {
  const id = request.params.id;
  const queryString = /*sql*/ `
    SELECT * 
    FROM artists WHERE id=?;`; // sql query
  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results[0]);
    }
  });
});

// GET Endpoint "/artists/:id" - get one artist
artistsRouter.get("/:id/albums", (request, response) => {
  const id = request.params.id;

  const queryString = /*sql*/ `
        SELECT DISTINCT albums.*, 
                        artists.name AS artistName,
                        artists.id AS artistId
        FROM albums
        LEFT JOIN albums_songs ON albums.id = albums_songs.album_id
        LEFT JOIN songs ON albums_songs.song_id = songs.id
        LEFT JOIN artists_songs ON songs.id = artists_songs.song_id
        LEFT JOIN artists ON artists_songs.artist_id = artists.id
        WHERE artists_songs.artist_id = ?;`;

  const values = [id];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

export default artistsRouter;
