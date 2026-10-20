## 1. Punto de partida y nombre de la copia.

Nombre de la entrega: tp-08-salas-http-mongodb
Origen: copia funcional del TP 07 individual. En este trabajo se migró la persistencia de reservas a MongoDB y se agregó una API JSON, conservando el sitio HTML.

## 2. Versiones utilizadas y confirmación del uso de Atlas Free (M0)

Node.js: v24.19.0
Mongoose: v9.11.2 (gestion de esquemas y conexion)
Express: v5.2.1 (servidor web y rutas)
Entorno de base de datos: MongoDB Atlas Free (M0), `reservas_salas_u8`
Coleccion: `reservas`

## 3. Pasos desde una descarga nueva: instalar dependencias, preparar el clúster gratuito, usuario e IP permitida, copiar la plantilla de entorno y ejecutar.

1. Instalar dependencias: Ejecutar `npm install` en la raiz del proyecto para instalar los modulos necesarios
2. Preparar cluster gratuito en MongoDB Atlas:
    * Crear un cluster gratuito en Atlas Free
    * Configurar un usuario de base de datos con permisos de lectura y escritura
    * Agregar la ip permitida correspondiente en el panel de red
3. Configurar el entorno:
    * Tomar como referencia el archivo `.env.example` y crear una copia nombrada ".env" en la raiz del proyecto
    * Reemplazar los marcadores de la variable `MONGODB_URI` con la URI provista por Atlas, especificando la base de datos
4. Ejecución de scripts y servidor:
    * Comprobar conexión: `node --env-file .env scripts/comprobar-conexion.js`
    * Crear una reserva: `node --env-file .env scripts/crear-reserva.js` Cada ejecución agrega una reserva a la base.
    * Listar reservas: `node --env-file .env scripts/listar-reservas.js`
    * Iniciar el servidor web con persistencia en MongoDB: `npm start`

## 4. Diagnóstico DNS y resolutores usados, si hubo ajustes; comandos exactos de conexión, creación, listado, calidad y arranque web.

Diagnóstico DNS y resolutores usados: Para evitar bloqueos o fallos en la resolución de registros de MongoDB Atlas desde Node.js, se configuraron explícitamente los servidores DNS públicos autorizados (`8.8.8.8` y `1.1.1.1`) utilizando `dns.setServers(["8.8.8.8", "1.1.1.1"])` dentro de `src/config/base-datos.js` previo a la conexión

Comandos exactos de ejucucion:
Comprobar conexión: `node --env-file .env scripts/comprobar-conexion.js`
Crear reserva: `node --env-file .env scripts/crear-reserva.js`
Listar reservas: `node --env-file .env scripts/listar-reservas.js`
Control de calidad (Lint y Formato): `npm run check`
Arranque del sitio web: `npm start`

## 5. Estructura, capas y modelo

- `src/index.js`: carga la configuración, conecta con MongoDB antes de iniciar el servidor y gestiona el cierre ordenado.
- `src/app.js`: configura Express, middlewares y routers.
- `src/config/`: configuración del entorno y conexión con MongoDB.
- `src/modelos/reserva.js`: esquema de Mongoose asociado a la colección `reservas`.
- `src/servicios/reservas.js`: operaciones de listar, buscar por ID, contar y crear reservas en MongoDB.
- `src/controladores/reservas.js`: coordina las operaciones y prepara las respuestas HTML o JSON.
- `src/rutas/reserva.js`: rutas del sitio HTML.
- `src/rutas/api-reservas.js`: rutas de la API JSON.
- `src/middleware/`: middlewares de validación y solicitudes.

El sitio HTML y la API usan el mismo servicio y consultan la misma colección `reservas`. No se cargan reservas automáticamente al iniciar.

El modelo define estos campos: `estudiante`, `email`, `sala`, `fecha`, `turno` y `personas`. MongoDB genera el identificador `_id`.

## 6. Validaciones y límites

La API rechaza con estado 400 los cuerpos vacíos o que no sean objetos JSON, y valida:

- `estudiante`: texto obligatorio, sin quedar vacío tras quitar espacios.
- `email`: texto que debe contener `@`.
- `sala`: debe ser `Sala Norte`, `Sala Sur` o `Sala Multimedia`.
- `turno`: debe ser `Mañana`, `Tarde` o `Noche`.
- `fecha`: texto obligatorio y no vacío.
- `personas`: número entero entre 1 y 6.

Al crear una reserva, se envían al servicio solo esos seis campos; datos extra como `estado` o `_id` no se asignan desde el body.

Límites conocidos: no se verifica el formato completo del email ni si la fecha existe en el calendario o es futura. Tampoco se controlan solapamientos, cupos compartidos ni reservas duplicadas.

## 7. Pruebas realizadas y persistencia

| Caso | Resultado observado |
|---|---|
| Conexión a MongoDB y arranque | Conectó antes de iniciar el servidor |
| Cierre con Ctrl+C | Cerró el servidor y la conexión a MongoDB |
| Listado inicial | Respondió `200` con una lista vacía |
| Crear reserva desde la API | Respondió `201`, devolvió el documento y envió `Location` |
| Consultar la reserva creada | Respondió `200` con el documento solicitado |
| Consultar después de reiniciar | La reserva seguía disponible |
| ID mal formado (`1`) | Rechazado como ID inválido |
| ID válido inexistente | Respondió que la reserva no fue encontrada |
| Email sin `@` | Rechazado; el GET posterior mantuvo 4 reservas |
| Sala no permitida | Rechazada; el GET posterior mantuvo 4 reservas |
| Turno no permitido | Rechazado; el GET posterior mantuvo 4 reservas |
| Fecha vacía | Rechazada; el GET posterior mantuvo 4 reservas |
| Personas `0`, `7`, `2.5`, `"abc"`, `true`, `[]` y `{}` | Rechazados; el GET posterior mantuvo 4 reservas |
| POST sin body | Respondió que se requiere un objeto JSON con datos |
| JSON mal formado | Express devolvió una página HTML con un error de sintaxis |
| Campos extra `estado` y `_id` | La reserva se creó sin asignar `estado` y con un `_id` generado por MongoDB |
| Filtro por sala | Devolvió solo coincidencias exactas; sin coincidencias devolvió `[]` |
| Parámetro `sala` repetido | Respondió `400` |
| Formulario HTML inválido | Mostró el error del estudiante obligatorio |
| Reserva creada desde el formulario HTML | Apareció también en el listado de la API |

Durante las pruebas, el listado mostró 4 reservas después de los rechazos. Luego se creó una reserva válida con campos extra y otra desde el formulario HTML; no se registró el total final después de estas dos creaciones. Las capturas de Postman y del sitio deben acompañar la entrega como evidencia de los resultados observados.

## 8. Cambios respecto del TP 07

Se reemplazó el arreglo en memoria como fuente de reservas. Ahora el sitio HTML y la API usan el mismo servicio y guardan y consultan los documentos de MongoDB. La aplicación conecta con la base antes de empezar a escuchar y cierra ordenadamente el servidor y la conexión al recibir `Ctrl+C` o `SIGTERM`.

## 9. Confirmación de que no se publican .env, credenciales ni datos personales

El archivo .env, que contiene la URI privada de conexion, esta excluida de GIT mediante .gitignore. se versiona unicamente .env.example, con valores de ejemplo y sin credenciales, las reservas de prueba usan datos ficticios, no se incluyen datos personales reales

## 10. Endpoints y pruebas de la API

Base: `http://localhost:3000`

| Método | Ruta | Resultado esperado |
|---|---|---|
| GET | `/api/reservas` | `200`, listado JSON |
| GET | `/api/reservas?sala=Sala%20Norte` | `200`, reservas de esa sala |
| GET | `/api/reservas/:id` | `200`; `400` si el ID es inválido; `404` si no existe |
| POST | `/api/reservas` | `201`, reserva creada y cabecera `Location` |

Para probar el POST, elegir **Body → raw → JSON** y enviar `Content-Type: application/json`:

```json
{
  "estudiante": "Prueba",
  "email": "prueba@example.com",
  "sala": "Sala Norte",
  "fecha": "2026-10-22",
  "turno": "Tarde",
  "personas": 2
}
```

- Para consultar una reserva: `GET /api/reservas/:id`, usando el ID devuelto por el POST.
- Para probar errores: enviar un ID inválido y un POST con datos inválidos; se espera `400`.
- Para probar persistencia: reiniciar el servidor y consultar de nuevo el mismo ID.
- Adjuntar capturas o registros de las pruebas, ocultando cualquier dato personal o secreto.