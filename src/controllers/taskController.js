const TaskModel = require("../models/schemas/tasksSchema");

const _findOnTasks = async (conditions) => {
    return await TaskModel.find(conditions);
}

const _findOneOnTasks = async (conditions) => {
    return await TaskModel.findOne(conditions, "-__v");
}

//Ejecuta un callback y agrega su control de excepciones para no repetir tanto codigo.
const _internalExecute = (pCallback) => {
    try {
        return pCallback();
    } catch (error) {
        throw new Error(error.message);
    }
}

//Añade una nueva tarea
exports.AddTask = async (body) => {
    return await _internalExecute(async () => {
        const task = new TaskModel(body)
        await task.save();
    })
};

//Obtiene todas las tareas
exports.GetTasks = async () => {
    return _internalExecute(async () => {
        return await _findOnTasks({})
    })

}

//Elimina una tarea, segun su id
exports.DeleteTask = async (id) => {
    return _internalExecute(async () => {
        return await TaskModel.findOneAndRemove({ Id: id });
    })
}

//Obtiene una tarea segun si identificador.
exports.GetTask = async (id) => {
    return _internalExecute(async () => {
        return await _findOneOnTasks({ Id: id });
    })
}




