//GET Endpoint "/artists" - Get All Artists

artistsRouter.get("/", (request, response) => {
  const queryString = /*sql*/ `
    SELECT * FROM artists ORDER BY name;
  `;

  dbConnection.query(queryString, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response.json(results);
    }
  });
});

//GET Endpoint "/artists/search" - Search for Artists
artistsRouter.get("/search", (request, response) => {
  const query = request.query.q;
  const queryString = /*sql*/ `
    SELECT * FROM artists
    WHERE name LIKE ?
    ORDER BY name;
  `;
  const values = [`%${query}%`];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response.json(results);
    }
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
artistsRouter.post('/', (request, response) => {
  const { name, imageUrl } = request.body;
  
  const queryString = /*sql*/ `
    INSERT INTO artists (name, imageUrl) VALUES (?, ?);
  `;
  const values = [name, imageUrl];

  dbConnection.query(queryString, values, (error, results) => {
    if (error) {
      response.status(500).json({ error: "Internal Server Error" });
    } else {
      response.status(201).json({ message: "Artist created successfully", artistId: results.insertId });
    }
  });
});
