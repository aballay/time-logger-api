const _response = (status,msg) => 
 {
  return {
    status : status,
    message : msg
  } 
}

const responses = {
    errorResponse: (msg,status) => {
        return _response(status ? status : 400,`Error al realizar la operación: ${msg}`)
    },
    okResponse: (status) => {
        return _response(status ? status : 200,"Operación realizada con éxito");
    },
    createdOkResponse: () => {
        return _response(201,"Operación realizada con éxito");
  }
}
  
  module.exports = responses;
