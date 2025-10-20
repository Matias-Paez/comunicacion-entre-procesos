import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

interface Mensaje {
  id: number;
  texto: string;
  origen: "usuario" | "canal";
  correcto?: boolean;
}


// la direccion http://192.168.1.36:PORT corresponde --> a la maquina virtual 
//const socketFuente = io("http://192.168.1.36:3000");
//const socketCanal = io("http://192.168.1.36:4000");

const socketFuente = io("http://localhost:3000");
const socketCanal = io("http://localhost:4000");


export default function App() {
  const [mensaje, setMensaje] = useState("");
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);

  useEffect(()  => {
    socketCanal.emit("registrarDestinatario");

    socketCanal.on("mensajeCanal", (mensaje: string) => {
      const [texto, checksum] = mensaje.split("|");
      const nuevoChecksum = texto
        .split("")
        .reduce((a, c) => a + c.charCodeAt(0), 0)
        .toString();
      const correcto = nuevoChecksum === checksum;

      setMensajes((prev) => [
        ...prev,
        { id: Date.now(), texto, correcto, origen: "canal" },
      ]);
    });
    console.log(mensajes);
    return () => socketCanal.off("mensajeCanal");
    
  }, []);

  const enviar = () => {
    if (!mensaje.trim()) return;
    setMensajes((prev) => [
      ...prev,
      { id: Date.now(), texto: mensaje, origen: "usuario" },
    ]);
    socketFuente.emit("nuevoMensaje", mensaje);
    setMensaje("");
  };

  return (
    <div className="app-container">
      <div className="chat-card">
        <h1 className="chat-title">Comunicación entre Procesos</h1>

        <div className="chat-box">
          {mensajes.length === 0 ? (
            <p className="chat-empty">No hay mensajes aún...</p>
          ) : (
            mensajes.map((m) => (
              <div
                key={m.id}
                className={`chat-message ${
                  m.origen === "usuario" ? "user" : "canal"
                }`}
              >
                <div
                  className={`bubble ${
                    m.origen === "usuario"
                      ? "user-bubble"
                      : m.correcto
                      ? "ok-bubble"
                      : "error-bubble"
                  }`}
                >
                  <span className="sender">
                    {m.origen === "usuario" ? "Fuente" : "Canal"}
                  </span>
                  <span className="text">
                    {m.texto}
                    {m.origen !== "usuario" && (
                      <span className="status">
                        {m.correcto ? " correcto " : "mensaje alterado"}
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            placeholder="Escribí tu mensaje..."
            onKeyDown={(e) => e.key === "Enter" && enviar()}
          />
          <button onClick={enviar}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
