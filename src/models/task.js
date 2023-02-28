const mongoose = require("mongoose");

//Define el schema de cada carga horaria asociada a una tarea.
const timeLogSchema = new mongoose.Schema({
  Date: {
    type: String,
    required: true
  },
  TimeLog: {
    Hours: { type: Number, required: true },
    Minutes: { type: Number, required: true },
    Seconds: { type: Number, required: true }
  },
  Description:{
    type:String,
    required:false
  }
});

//Define el schema de una tarea.
const taskSchema = new mongoose.Schema({
  Id: {
    type: Number,
    required: true,
    minlength: 4,
    unique: true
  },
  Name: {
    type: String,
    required: true
  },
  TimeLogHistory: [timeLogSchema]
});

const Task = mongoose.model("Tasks", taskSchema);

module.exports = Task;