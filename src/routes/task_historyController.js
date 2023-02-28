const express = require("express");
const router = express.Router();
const TaskHistory = require("../models/task_history");


router.post("/add", async (req, res) => {
  try {
    const { Id, Date, TimeLog, Description } = req.body;
    const taskHistory = await TaskHistory.findOne({ Date });
    if (taskHistory) {
      taskHistory.Data.push({ Id, TimeLog, Description });
      await taskHistory.save();
    } else {
      const newTaskHistory = new TaskHistory({
        Date,
        Data: [{ Id, TimeLog, Description }]
      });
      await newTaskHistory.save();
    }
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