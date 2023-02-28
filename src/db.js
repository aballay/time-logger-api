const mongoose = require("mongoose");

mongoose.set("strictQuery", true);
// Conectarse a MongoDB
mongoose.connect("mongodb://localhost:27017/TimerLoger", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Obtener la conexión a la base de datos
const db = mongoose.connection;



// Manejar errores de conexión
db.on("error", console.error.bind(console, "Error al conectar a MongoDB"));

// Mostrar un mensaje en la consola una vez conectado
db.once("open", () => {
  console.log("Conectado a MongoDB");
});

// Exportar la conexión
module.exports = db;