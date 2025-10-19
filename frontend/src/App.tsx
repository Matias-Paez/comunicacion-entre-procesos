import { useEffect, useState } from "react";
import { io } from "socket.io-client";

// 🔗 Conexión con la FUENTE y el CANAL
const socketFuente = io("http://localhost:3000");
const socketCanal = io("http://localhost:4000");

export default function App() {
  const [mensaje, setMensaje] = useState("");
  const [resultado, setResultado] = useState("");

  useEffect(() => {
    // Registrar React como destinatario ante el canal
    socketCanal.emit("registrarDestinatario");

    socketCanal.on("mensajeCanal", (mensaje) => {
      const [texto, checksum] = mensaje.split("|");
      const nuevoChecksum = texto
        .split("")
        .reduce((a, c) => a + c.charCodeAt(0), 0)
        .toString();
      const correcto = nuevoChecksum === checksum;

      setResultado(
        `Mensaje recibido: "${texto}" → ${
          correcto ? "✅ Correcto" : "❌ Con errores"
        }`
      );
    });

    return () => socketCanal.off("mensajeCanal");
  }, []);

  const enviar = () => {
    if (mensaje.trim() === "") return;
    socketFuente.emit("nuevoMensaje", mensaje);
    setMensaje("");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 space-y-6">
      <h1 className="text-3xl font-bold">💬 Comunicación entre Procesos</h1>

      <div className="flex space-x-2">
        <input
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          placeholder="Escribí un mensaje..."
          className="border rounded px-3 py-2"
        />
        <button
          onClick={enviar}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>

      {resultado && (
        <div className="p-4 bg-white rounded shadow text-lg">{resultado}</div>
      )}
    </div>
  );
}
