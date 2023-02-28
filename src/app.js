const express = require("express");
const app = express();
const port = process.env.PORT || 3200;
const db = require("./db");
const taskRouter = require("./routes/task");
const taskHistoryRouter = require("./routes/task_historyController");

// Permitir el acceso a los datos en el cuerpo de la solicitud
app.use(express.json());

// Establecer la ruta base para las rutas de tareas
app.use("/tasks", taskRouter);
//Establece la ruta base para las rutas de historyTask
app.use("/history",taskHistoryRouter)

// Iniciar la aplicación en el puerto especificado
app.listen(port, () => {
  console.log(`Servidor iniciado en el puerto ${port}`);
});