import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

let destinatarioSockets = [];

io.on("connection", (socket) => {
  console.log("FUENTE o REACT conectado al CANAL");

  socket.on("mensajeFuente", (mensaje) => {
    let mensajeFinal = mensaje;

    if (Math.random() < 0.3) {
      const chars = mensaje.split("");
      const i = Math.floor(Math.random() * chars.length);
      chars[i] = String.fromCharCode(chars[i].charCodeAt(0) + 1);
      mensajeFinal = chars.join("");
      console.log("⚠️ Mensaje ALTERADO:", mensajeFinal);
    } else {
      console.log("✅ Mensaje intacto:", mensajeFinal);
    }

    // 🔗 Enviar mensaje al destinatario (React)
    destinatarioSockets.forEach((s) => s.emit("mensajeCanal", mensajeFinal));
  });

  socket.on("registrarDestinatario", () => {
    destinatarioSockets.push(socket);
    console.log("React registrado como destinatario");
  });
});

server.listen(4000, "0.0.0.0", () => console.log("CANAL corriendo en puerto 4000"));
