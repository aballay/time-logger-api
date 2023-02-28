const mongoose = require("mongoose");

//Define el schema de cada carga horaria asociada a una tarea.
const HistoryDataSchema = new mongoose.Schema({
    Id:{
        type:Number,
        required:true,
    },
  Date: {
    type: String,
    required: false
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
}
  );

  //Define el schema de una tarea.
const HistorySchema = new mongoose.Schema({
    Date : {
        type:String,
        unique:true,
        required:false,
    },
    
    Data: [HistoryDataSchema]
  });

  const TaskHistory = mongoose.model("TasksHistory", HistorySchema);

  module.exports = TaskHistory;