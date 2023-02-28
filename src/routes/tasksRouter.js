const express = require("express");
const router = express.Router();
const TaskModel = require("../models/schemas/tasksSchema");
const TaskController = require("../controllers/taskController");
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

const _getOkRequest = (res,data) => {
  if(!data){
    return  res.status(200).json(responses.okResponse());
  }
  res.status(200).json(_addDataToResponse(responses.okResponse(),data))
}

const _getCreatedOkRequest = (res) => {
  res.status(201).json(responses.createdOkResponse())
}

const _addDataToResponse  = (response,data) => {
    return {...response,...data}
}



// Añadir una tarea
router.post("/", async (req, res) => {
  try {

    await TaskController.AddTask(req.body);
    _getCreatedOkRequest(res);

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
    
    _getOkRequest(res,{Tasks:await TaskController.GetTasks()})
  } catch (error) {
    _getBadRequest(res, error)
  }
});

// Eliminar una tarea.
router.delete("/:id", async (req, res) => {
  try {
    const task = await TaskController.DeleteTask(req.params.id);
    if (!task) {
      _getNotFoundRequest(res,`No se encontró una tarea con el Id : ${req.params.id}`)
    } else {
      _getOkRequest(res);
    }
  } catch (error) {
    _getBadRequest(res, error);
  }
});

//Obtener una tarea con id especifico
router.get("/:id", async (req, res) => {
  try {
    const task = await TaskController.GetTask(req.params.id);
    
    if (!task) return _getBadRequest(res,"No se encontró la tarea solicitada");

    _getOkRequest(res,{task:task});
   
  } catch (error) {
    _getInternalError(res,error.message)
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
    const {id,date} = req.params;
   
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
    
    _getOkRequest(res,{Time:time});

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
  
    _getOkRequest(res);

  } catch (error) {
    _getBadRequest(res,"error");
  }
});

module.exports = router;