const { salasPermitidas } = require("../middleware/reservas");

const crearControladorReservas = (servicio) => {
  const listarReservas = async (req, res) => {
    res.render("reservas/lista", {
      titulo: "Listado de Reservas",
      reservas: await servicio.listar(),
    });
  };

  const listarApi = async (req, res) => {
    try {
      const sala = req.query.sala;

      if (sala !== undefined && typeof sala !== "string") {
        return res
          .status(400)
          .json({ error: "El parámetro sala no puede repetirse" });
      }

      const reservas = await servicio.listar(sala);
      res.status(200).json(reservas);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

  const obtenerApiPorId = async (req, res) => {
    const id = req.params.id;

    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({ error: "ID inválido" });
    }

    try {
      const reserva = await servicio.buscarPorId(id);

      if (!reserva) {
        return res.status(404).json({ error: "Reserva no encontrada" });
      }

      return res.status(200).json(reserva);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  const crearApi = async (req, res) => {
    try {
      const reserva = await servicio.crear(req.reservaValidada);

      return res
        .status(201)
        .location(`/api/reservas/${reserva._id}`)
        .json(reserva);
    } catch (error) {
      return res.status(500).json({ error: error.message });
    }
  };

  const formularioNuevaReserva = (req, res) => {
    res.render("reservas/nueva", {
      titulo: "Nueva Reserva",
      salasPermitidas,
      errores: [],
      valores: {},
    });
  };

  const obtenerReservaPorId = async (req, res) => {
    const id = req.params.id;
    const reserva = await servicio.buscarPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: `No se encontró la reserva con ID ${req.params.id}`,
      });
    }

    res.render("reservas/detalle", { titulo: "Detalle de Reserva", reserva });
  };

  const crearReserva = async (req, res) => {
    await servicio.crear(req.reservaValidada);
    res.redirect("/reservas");
  };

  const obtenerEstado = async (req, res) => {
    res.json({
      servicio: "activo",
      reservas: await servicio.obtenerCantidad(),
      solicitudId: res.locals.solicitudId,
    });
  };

  return {
    listarReservas,
    formularioNuevaReserva,
    obtenerReservaPorId,
    crearReserva,
    obtenerEstado,
    listarApi,
    obtenerApiPorId,
    crearApi,
  };
};

module.exports = { crearControladorReservas };
