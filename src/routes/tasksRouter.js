const express = require("express");
const router = express.Router();
const TaskModel = require("../models/schemas/tasksSchema");
const responses = require("../models/responses/responses");

const _getBadRequest = (res, errorMessage) => {
  res.status(400).json(responses.errorResponse(errorMessage));
}

const _getInternalError = (res, errorMessage) => {
  res.status(500).send(responses.errorResponse(errorMessage, 500));
}

const _getNotFoundRequest = (res, errorMessage) => {
  res.status(404).json(responses.errorResponse(errorMessage, 404));
}


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
      _getBadRequest(res, "Ya existe una tarea con ese Id");
    } else {
      _getBadRequest(res, error.message);
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
    _getBadRequest(res, error)
  }
});

// Eliminar una tarea.
router.delete("/:id", async (req, res) => {
  try {
    const task = await TaskModel.findOneAndRemove({ Id: req.params.id });
    if (!task) {
      _getNotFoundRequest(res,`No se encontró una tarea con el Id : ${req.params.id}`)
    } else {
      res.status(200).json({
        status: 200,
        message: "Operación realizada con éxito"
      });
    }
  } catch (error) {
    _getBadRequest(res, errorMessage);
  }
});

//Obtener una tarea con id especifico
router.get("/:id", async (req, res) => {
  try {
    const task = await TaskModel.findOne({ Id: req.params.id }, "-__v");
    if (!task) return _getBadRequest(res,"No se encontró la tarea solicitada");
    res.send({ status: 200, message: "Operación realizada con éxito", task });
  } catch (error) {
    _getInternalError(error.message)
  }
});

//Obtener la cantidad de horas totales de una tarea en el dia de hoy.
function sumTime(timeLogHistory) {
   let totalMinutes = 0;
  let totalSeconds = 0;
  for (let timeLog of timeLogHistory) {
    let { Hours, Minutes, Seconds } = timeLog.TimeLog;
    totalMinutes += parseInt(Hours) * 60 + parseInt(Minutes);
    totalSeconds += parseInt(Seconds);
  }
    let totalHours = Math.floor(totalMinutes / 60);
    totalMinutes = totalMinutes % 60;
    totalHours += Math.floor(totalSeconds / 3600);
    totalSeconds = totalSeconds % 3600;

  return {
    Hours: totalHours,
    Minutes: totalMinutes,
    Seconds: totalSeconds
  };
}

router.get("/time/:id/:date", async (req, res) => {
  try {
    console.log("STEP 0 ")
    const id = req.params.id;
    const date = req.params.date
   
    const task = await TaskModel.findOne({Id: id});
    if(!task){
      return _getNotFoundRequest(res,`No se encontro la tarea con Id : ${id}`)
    }

    const tasks = await TaskModel.find({
      Id: id,
      "TimeLogHistory.Date": date
    }, "-__v");

    if (tasks.length === 0) {
      return _getNotFoundRequest(res,`No se encontraron tareas para el día especificado : ${date}`)
    }
    const timeLogToday = tasks[0].TimeLogHistory.filter(item => item.Date === date);

    const time = sumTime(timeLogToday);
    res.status(200).send({
      Status: 200,
      Message: "Operación realizada con éxito",
      Time: time
    });
  } catch (error) {
    _getBadRequest(res,error);
  }
});

router.patch("/addlog", async (req, res) => {
  try {
    const { id, data: { Date, TimeLog, Description } } = req.body;

    if (!id && !Date && !TimeLog) {
      return _getBadRequest(res,"Debe proveer correctamente los atributos id, Date,TimeLog");
    }

    const task = await TaskModel.findOne({ Id: id });
    if (!task) {
      return _getNotFoundRequest(res,"No se encontró la tarea especificada")
    }
    task.TimeLogHistory.push({ Date: Date, TimeLog: TimeLog, Description: Description });
    await task.save();
    res.status(200).send({
      Status: 200,
      Message: "Operación realizada con éxito"
    });
  } catch (error) {
    _getBadRequest(res,"error");
  }
});

module.exports = router;