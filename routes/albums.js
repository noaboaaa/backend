import { Router } from "express";
import dbConnection from "../db-connect.js";

const albumsRouter = Router();

// GET Endpoint "/albums" - get all albums
albumsRouter.get("/", (request, response) => {
  const queryString = /*sql*/ `
            SELECT DISTINCT albums.*,
                artists.name AS artistName,
                artists.id AS artistId
            FROM albums
            LEFT JOIN albums_songs ON albums.id = albums_songs.album_id
            LEFT JOIN songs ON albums_songs.song_id = songs.id
            LEFT JOIN artists_songs ON songs.id = artists_songs.song_id
            LEFT JOIN artists ON artists_songs.artist_id = artists.id;
    `;
  dbConnection.query(queryString, (error, results) => {
    if (error) {
      console.log(error);
    } else {
      response.json(results);
    }
  });
});

// GET Endpoint "/albums/:id"
albumsRouter.get("/:id", (request, response) => {
    const id = request.params.id;

    const queryString = /*sql*/ `
            SELECT albums.*,
                artists.name AS artistName,
                albums_songs.position,
                songs.id AS songId,
                songs.title AS songTitle,
                songs.length AS songLength,
                songs.release_date AS songReleaseDate,
                artists.id AS artistId
            FROM albums
            LEFT JOIN albums_songs ON albums.id = albums_songs.album_id
            LEFT JOIN songs ON albums_songs.song_id = songs.id
            LEFT JOIN artists_songs ON songs.id = artists_songs.song_id
            LEFT JOIN artists ON artists_songs.artist_id = artists.id
            WHERE albums.id = ?
            ORDER BY albums_songs.position;
    `;
    const values = [id];

    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results[0]) {
                const album = results[0];
                const albumWithSongs = {
                    id: album.id,
                    title: album.title,
                    releaseDate: album.release_date,
                    songs: results.map(song => {
                        return {
                            id: song.songId,
                            title: song.songTitle,
                            length: song.songLength,
                            releaseDate: song.songReleaseDate,
                            position: song.position
                        };
                    })
                };

                response.json(albumWithSongs);
            } else {
                response.json({ message: "No album found" });
            }
        }
    });
});

// GET Endpoint "/albums/:id/songs" - get album with songs
albumsRouter.get("/:id/songs", (request, response) => {
    const id = request.params.id;

    const queryString = /*sql*/ `
        SELECT albums.id AS albumId,
            albums.title AS albumTitle,
            albums.release_date AS albumReleaseDate,
            songs.id AS songId,
            songs.title AS songTitle,
            songs.length AS songLength,
            songs.release_date AS songReleaseDate,
            artists.name AS artistName
        FROM albums
        INNER JOIN albums_songs ON albums.id = albums_songs.album_id
        INNER JOIN songs ON albums_songs.song_id = songs.id
        INNER JOIN artists_songs ON songs.id = artists_songs.song_id
        INNER JOIN artists ON artists_songs.artist_id = artists.id
        WHERE albums.id = ?;
    `;
    const values = [id];

    dbConnection.query(queryString, values, (error, results) => {
        if (error) {
            console.log(error);
        } else {
            if (results.length) {
                response.json(results);
            } else {
                response.json({ message: "No album found" });
            }
        }
    });
});

export default albumsRouter;