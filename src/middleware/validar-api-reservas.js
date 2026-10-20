const { salasPermitidas, turnosPermitidos } = require("./reservas");

const validarApiReserva = (req, res, next) => {
  const cuerpo = req.body;

  if (
    !cuerpo ||
    typeof cuerpo !== "object" ||
    Array.isArray(cuerpo) ||
    Object.keys(cuerpo).length === 0
  ) {
    return res
      .status(400)
      .json({ error: "El body debe ser un objeto JSON con datos" });
  }

  const estudiante =
    typeof cuerpo.estudiante === "string" ? cuerpo.estudiante.trim() : "";
  const email = typeof cuerpo.email === "string" ? cuerpo.email.trim() : "";
  const sala = typeof cuerpo.sala === "string" ? cuerpo.sala.trim() : "";
  const fecha = typeof cuerpo.fecha === "string" ? cuerpo.fecha.trim() : "";
  const turno = typeof cuerpo.turno === "string" ? cuerpo.turno.trim() : "";
  const personas = cuerpo.personas;

  if (!estudiante) {
    return res.status(400).json({ error: "El estudiante es obligatorio" });
  }

  if (!email.includes("@")) {
    return res.status(400).json({ error: "El email debe contener un @" });
  }

  if (!salasPermitidas.includes(sala)) {
    return res.status(400).json({ error: "La sala no está permitida" });
  }

  if (!turnosPermitidos.includes(turno)) {
    return res.status(400).json({ error: "El turno no está permitido" });
  }

  if (!fecha) {
    return res.status(400).json({ error: "La fecha es obligatoria" });
  }

  if (!Number.isInteger(personas) || personas < 1 || personas > 6) {
    return res
      .status(400)
      .json({ error: "Personas debe ser un entero entre 1 y 6" });
  }

  req.reservaValidada = { estudiante, email, sala, fecha, turno, personas };
  next();
};

module.exports = { validarApiReserva };
