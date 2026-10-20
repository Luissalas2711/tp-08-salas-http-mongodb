const reserva = require("../modelos/reserva");

const crearServicioReserva = () => {
  const listar = async (sala) =>
    sala ? reserva.find({ sala }) : reserva.find({});

  const buscarPorId = async (id) => {
    const resultados = await reserva.find({ _id: id });
    return resultados[0];
  };

  const obtenerCantidad = async () => (await reserva.find({})).length;

  const crear = async (datos) => reserva.create(datos);

  return {
    listar,
    buscarPorId,
    obtenerCantidad,
    crear,
  };
};

module.exports = { crearServicioReserva };
