const express = require("express");
const { validarApiReserva } = require("../middleware/validar-api-reservas");

const crearRouterApiReservas = (controladorReservas) => {
  const router = express.Router();

  router.get("/", controladorReservas.listarApi);
  router.get("/:id", controladorReservas.obtenerApiPorId);
  router.post("/", validarApiReserva, controladorReservas.crearApi);

  return router;
};

module.exports = { crearRouterApiReservas };
