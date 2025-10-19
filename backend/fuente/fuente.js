import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import ioClient from "socket.io-client";

const app = express();
const server = createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

// 🔗 Conexión con el canal
const canalSocket = ioClient("http://localhost:4000");

io.on("connection", (socket) => {
  console.log("Cliente (React) conectado a FUENTE");

  socket.on("nuevoMensaje", (msg) => {
    const checksum = msg.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    const mensajeConChecksum = `${msg}|${checksum}`;

    console.log("Enviando al canal:", mensajeConChecksum);

    canalSocket.emit("mensajeFuente", mensajeConChecksum);
  });
});

server.listen(3000, "0.0.0.0", () => console.log("FUENTE corriendo en puerto 3000"));
