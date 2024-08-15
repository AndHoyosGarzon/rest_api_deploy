const express = require("express");
const crypto = require("node:crypto");
const cors = require("cors");
const movies = require("./movies.json");
const { validateMovie, validatePartialMovie } = require("./schemas/movies");

const app = express();

app.use(express.json());

app.disable("x-powered-by");

// el  problema de la linea 15 lo podemos solucionar con un middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const ACCEPTED_ORIGINS = [
        "http://localhost:8080",
        "http://localhost:1234",
        "https://localhost:5000",
        "https://movies.com",
      ];
      if (ACCEPTED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      if (!origin) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by cors"));
    },
  })
);

/**CORS
 * Primero se detecta el origen y despues vemos que solucion damos
 */
const ACCEPTED_ORIGINS = [
  "http://localhost:8080",
  "http://localhost:1234",
  "https://localhost:5000",
  "https://movies.com",
];

app.get("/movies", (req, res) => {
  const { genre } = req.query;
  //Aqui recuperamos el la cabezera de Origin que hace la peticion
  const origin = req.header("origin");
  //aqui validamos si esta el origin
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //esto nos retorna un true o false
    //si accede a este bloque dando true en la validacion
    //agregamos el permiso de cors para el puerto de peticion
    res.header("Access-Control-Allow-Origin", origin);
  }

  if (genre) {
    const filteredMovies = movies.filter((movie) =>
      movie.genre.some((g) => g.toLowerCase() === genre.toLowerCase())
    );
    return res.json(filteredMovies);
  }

  res.status(200).json(movies);
});

app.get("/movies/:id", (req, res) => {
  const { id } = req.params;

  const movie = movies.find((movie) => movie.id === id);
  if (movie) return res.json(movie);

  res.status(404).json({ msg: "Movie not found" });
});

app.post("/movies", (req, res) => {
  const result = validateMovie(req.body);

  if (result.error) {
    res.status(400).json({ error: JSON.parse(result.error.message) });
  }

  const newMovie = {
    id: crypto.randomUUID(),
    ...result.data,
  };

  movies.push(newMovie);

  res.status(201).json(newMovie);
});

app.patch("/movies/:id", (req, res) => {
  const result = validatePartialMovie(req.body);

  if (!result.success) {
    return res.status(404).json({ error: JSON.parse(result.error.message) });
  }

  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);

  if (movieIndex < 0)
    return res.status(404).json({ message: "Movie Not Found" });

  const updateMovie = {
    ...movies[movieIndex],
    ...result.data,
  };

  movies[movieIndex] = updateMovie;

  return res.json(updateMovie);
});

//en este metodo detelete apareceran problemas de Cors ya que
//tiene inconcenientes por que es un metodo complejo junto con
// put pach y esto se llama CORS PRE-FLIGHT y esto requiere
//una peticion especial que se llama OPTIONS
app.delete("/movies/:id", (req, res) => {
  const { id } = req.params;
  const movieIndex = movies.findIndex((movie) => movie.id === id);
  if (movieIndex === -1) {
    return res.status(404).json({ message: "Movie Not Found" });
  }

  movies.splice(movieIndex, 1);

  return res.json({ message: "Movie deleted ok" });
});

//A qui solucionamos el problema del delete con el metodo OPTIONS
app.options("/movies/:id", (req, res) => {
  const origin = req.header("origin");
  //aqui validamos si esta el origin
  if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //esto nos retorna un true o false
    //si accede a este bloque dando true en la validacion
    //agregamos el permiso de cors para el puerto de peticion
    res.header("Access-Control-Allow-Origin", origin);
    //agregamos una cabezera que le indiqu cuales son los metodos
    //que puede utilizar
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE");
  }
  res.send(200);
});

const PORT = process.env.PORT ?? 3000;
app.listen(PORT, (req, res) => {
  console.log(`Server Listening on PORT http://localhost:${PORT}`);
});
