# API de gestión hotelera

API REST para gestionar habitaciones y reservas con Express y MySQL.

## Configuración

Requiere Node.js 22.12 o superior y MySQL 8 o compatible, con las tablas
`habitaciones` y `reservas` creadas en la base de datos.

Configure las variables `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD` y
`DB_NAME` en el archivo `.env` de la raíz del proyecto. Inicie el servidor con
`npm start` o `npm run dev`.

La API escucha en `http://localhost:3000` por defecto. En producción, defina
las variables de entorno en la plataforma de despliegue.

## Endpoints

| Método | Ruta | Acción |
| --- | --- | --- |
| GET | `/rooms` | Consultar habitaciones |
| GET | `/rooms/:codigo` | Consultar una habitación |
| POST | `/rooms` | Crear una habitación |
| PATCH | `/rooms/:codigo` | Actualizar una habitación |
| DELETE | `/rooms/:codigo` | Eliminar una habitación |
| GET | `/reservations` | Consultar reservas |
| GET | `/reservations/:codigo` | Consultar una reserva |
| POST | `/reservations` | Crear una reserva |
| PATCH | `/reservations/:codigo` | Actualizar una reserva |
| DELETE | `/reservations/:codigo` | Eliminar una reserva |

Ejemplo de cuerpo para crear una habitación:

```json
{
  "numero": 101,
  "tipo": "Doble",
  "valor": 180000
}
```

Ejemplo de cuerpo para crear una reserva:

```json
{
  "codigo_habitacion": 1,
  "nombre_cliente": "Ana Pérez",
  "telefono_cliente": "3001234567",
  "fecha_entrada": "2026-12-10",
  "fecha_salida": "2026-12-12"
}
```

`habitaciones` utiliza `codigo INT`, `numero INT`, `tipo VARCHAR(50)` y
`valor FLOAT`. `reservas` utiliza `codigo INT`, `codigo_habitacion INT` como
llave foránea, `nombre_cliente VARCHAR(100)`, `telefono_cliente VARCHAR(20)`,
`fecha_reservacion DATETIME`, `fecha_entrada DATE` y `fecha_salida DATE`.

`fecha_reservacion` es opcional en la creación; si no se envía, la API registra
la fecha y hora actual en UTC. Las fechas de entrada y salida se envían como
`YYYY-MM-DD`; la fecha de reservación acepta `YYYY-MM-DD`,
`YYYY-MM-DD HH:mm:ss` o una fecha ISO. `fecha_salida` debe ser posterior a
`fecha_entrada`, tanto al crear como al actualizar una reserva.

Las operaciones de lectura, creación y actualización responden con un objeto
`data`; los errores incluyen un mensaje en `error.message`. Los códigos HTTP
incluyen `400` para solicitudes incorrectas, `404` para recursos inexistentes,
`409` para conflictos con la integridad de los datos y `503` cuando MySQL no
está disponible. Una eliminación exitosa responde `204` sin cuerpo.

Para verificar los endpoints manualmente, inicie el servidor y envíe solicitudes
GET, POST, PATCH y DELETE desde Thunder Client o Postman a
`http://localhost:3000`.