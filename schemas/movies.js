const z = require("zod");

const movieSchema = z.object({
  title: z.string({
    invalid_type_error: "Movie title must be string",
    required_error: "Movie title is required",
  }),
  year: z.number().int().min(1900).max(2025),
  director: z.string(),
  duration: z.number().int().positive(),
  rate: z.number().min(0).max(10).default(5),
  poster: z.string().url({ message: "poster must be a valid URL" }),
  genre: z.array(
    z.enum([
      "Action",
      "Adventure",
      "Comedy",
      "Drama",
      "Fantasy",
      "Horror",
      "Thriller",
      "Sci-Fi",
      "Economy",
    ])
  ),
});

function validateMovie(object) {
  return movieSchema.safeParse(object);
}

function validatePartialMovie(object){
  //la propiedad partial() del schema nos permite darle la opcion
  //a la petcion de que valide parcialmente di las opciones
  //entregadas estan bien ya que se hace sobre el tipo de dato de 
  //entrada en vez de verificar si envian todas las propiedades 
  return movieSchema.partial().safeParse(object)
}

module.exports = {
  validateMovie,
  validatePartialMovie
};











