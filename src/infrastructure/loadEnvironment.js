import { existsSync } from "node:fs";

if (existsSync(".env")) {
  if (typeof process.loadEnvFile !== "function") {
    throw new Error("Se requiere Node.js 22.12 o superior para cargar el archivo .env.");
  }
  process.loadEnvFile(".env");
}
