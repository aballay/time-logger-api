const responses = {
    errorResponse: (msg,status) => {
      return {
        status: status ? status : 400,
        message: `Error al realizar la operación: ${msg}`
      };
    },
    okResponse: (msg) => {
      return {
        status: 200,
        message: "Operación realizada con éxito",
      };
    },
  };
  
  module.exports = responses;
