const express = require("express");
const router = express.Router();
const TaskModel = require("../models/tasksScheme");

// Añadir una tarea
router.post("/", async (req, res) => {
  try {
    const task = new TaskModel(req.body);
    await task.save();
    res.status(201).json({
      status: 201,
      message: "Operación realizada con éxito"
    });
  } catch (error) {
    if (error.name === "MongoError" && error.code === 11000) {
      res.status(400).json({
        status: 400,
        message: "Error al realizar la operación: Ya existe una tarea con ese Id"
      });
    } else {
      res.status(400).json({
        status: 400,
        message: "Error al realizar la operación: " + error.message
      });
    }
  }
});

//Obtiene todas las tareas
router.get("/", async (req, res) => {
  try {
    const tasks = await TaskModel.find({});
    res.status(200).send({
      Status: 200,
      Message: "Operación realizada con éxito",
      Tasks: tasks
    });
  } catch (error) {
    res.status(400).send({
      Status: 400,
      Message: "Error al realizar la operación: " + error
    });
  }
});

// Eliminar una tarea.
router.delete("/:id", async (req, res) => {
  try {
    const task = await TaskModel.findOneAndRemove({ Id: req.params.id });
    if (!task) {
      res.status(404).json({
        status: 404,
        message: "Error al realizar la operación: No se encontró una tarea con el Id " + req.params.id
      });
    } else {
      res.status(200).json({
        status: 200,
        message: "Operación realizada con éxito"
      });
    }
  } catch (error) {
    res.status(400).json({
      status: 400,
      message: "Error al realizar la operación: " + error.message
    });
  }
});


//Obtener una tarea con id especifico
router.get("/:id", async (req, res) => {
  try {
    const task = await TaskModel.findOne({ Id: req.params.id }, "-__v");
    if (!task) return res.status(400).send({ status: 400, message: "No se encontró la tarea solicitada" });
    res.send({ status: 200, message: "Operación realizada con éxito", task });
  } catch (error) {
    res.status(500).send({ status: 500, message: "Error al realizar la operación: " + error });
  }
});


//Obtener la cantidad de horas totales de una tarea en el dia de hoy.
function sumTime(timeLogHistory) {
  let totalMinutes = 0;
  let totalSeconds = 0;
    for (let timeLog of timeLogHistory) {
      let hours = timeLog.TimeLog.Hours;
      let minutes = timeLog.TimeLog.Minutes;
      let seconds = timeLog.TimeLog.Seconds;
      totalMinutes += parseInt(hours) * 60 + parseInt(minutes);
      totalSeconds += parseInt(seconds);
    }
  let totalHours = Math.floor(totalMinutes / 60);
  totalMinutes = totalMinutes % 60;
  totalHours += Math.floor(totalSeconds / 3600);
  totalSeconds = totalSeconds % 3600;

  console.log(totalHours);
  return {
    Hours: totalHours,
    Minutes: totalMinutes,
    Seconds: totalSeconds
  };
}

router.get("/time/:id/:date", async (req, res) => {
  try {
    const id = req.params.id;
    const date = req.params.date
    const tasks = await TaskModel.find({
      Id: id,
      "TimeLogHistory.Date": date
    }, "-__v");

    if (tasks.length === 0) {
      return res.status(404).send({
        Status: 404,
        Message: "No se encontraron tareas para el día especificado"
      });
    }
    const timeLogToday = tasks[0].TimeLogHistory.filter(item => item.Date === date);

    const time = sumTime(timeLogToday);
    res.status(200).send({
      Status: 200,
      Message: "Operación realizada con éxito",
      Time: time
    });
  } catch (error) {
    res.status(400).send({
      Status: 400,
      Message: "Error al realizar la operación: " + error
    });
  }
});

router.patch("/addlog", async (req, res) => {
  try {
    const id = req.body.id;
    const date = req.body.data.Date;
    const timeLog = req.body.data.TimeLog;
    const description = req.body.data.Description;

    console.log(id, date, timeLog, description);

    if(!id && !date && !timeLog){
      return res.status(400).send({
        Status : 400,
        Message:"Debe proveer correctamente los atributos id, Date,TimeLog"
      })
    }
    
    const task = await TaskModel.findOne({ Id: id });
    console.log(task)
    if (!task) {
      return res.status(404).send({
        Status: 404,
        Message: "No se encontró la tarea especificada"
      });
    }
    task.TimeLogHistory.push({ Date: date, TimeLog: timeLog, Description: description });
    await task.save();
    res.status(200).send({
      Status: 200,
      Message: "Operación realizada con éxito"
    });
  } catch (error) {
    res.status(400).send({
      Status: 400,
      Message: "Error al realizar la operación: " + error
    });
  }
});


module.exports = router;