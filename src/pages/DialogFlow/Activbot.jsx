import React, { useState, useEffect } from "react";
import axios from "axios";
import "./style.css";

const ChatBot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const sessionId = "user-session-web";

  // ✅ MENSAJE DE BIENVENIDA
  useEffect(() => {
  setMessages([
    {
      from: "bot",
      text:
        "👋 ¡Hola! Soy tu asistente virtual del sistema.\n" +
        "Puedo ayudarte a conocer más sobre las funcionalidades más importantes, como:\n" +
        "• Información sobre actividades, eventos y lúdicas.\n" +
        "• Cómo navegar por la página.\n" +
        "• Para qué sirve cada sección que te ofrecemos.\n" +
        "• ¿Cómo puedo participar?\n\n" +
        "Con esto dicho, ¿en qué te puedo ayudar el día de hoy? 🫡",
    },
  ]);
}, []);


  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMessage = { from: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const lowerInput = input.toLowerCase();

      // 🔹 ACTIVIDADES
      if (
        lowerInput.includes("actividad") &&
        !lowerInput.includes("botón") &&
        !lowerInput.includes("sirve")
      ) {
        const res = await axios.get("https://render-hhyo.onrender.com/api/actividad");

        if (!res.data || res.data.length === 0) {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "No encontré actividades disponibles en este momento." },
          ]);
          setInput("");
          return;
        }

        const cards = res.data.map((a) => ({
          Nombre: a.NombreActi,
          Fecha: a.FechaInicio,
          Hora: `${a.HoraInicio} - ${a.HoraFin}`,
          Lugar: a.Ubicacion,
          Imagen: a.Imagen,
        }));

        setMessages((prev) => [...prev, { from: "bot", type: "cards", cards }]);
        setInput("");
        return;
      }

      // 🔹 EVENTOS
      if (
        lowerInput.includes("evento") &&
        !lowerInput.includes("botón") &&
        !lowerInput.includes("sirve")
      ) {
        const res = await axios.get("https://render-hhyo.onrender.com/api/evento");

        if (!res.data || res.data.length === 0) {
          setMessages((prev) => [
            ...prev,
            { from: "bot", text: "No encontré eventos programados por ahora." },
          ]);
          setInput("");
          return;
        }

        const cards = res.data.map((e) => ({
          Nombre: e.NombreEvento,
          Fecha: `${e.FechaInicio} - ${e.FechaFin}`,
          Hora: `${e.HoraInicio} - ${e.HoraFin}`,
          Lugar: e.UbicacionEvento,
          Imagen: e.PlanificacionEvento?.ImagenUrl,
        }));

        setMessages((prev) => [...prev, { from: "bot", type: "eventCards", cards }]);
        setInput("");
        return;
      }

      // 🔹 DIALOGFLOW
      const res = await axios.post("https://render-hhyo.onrender.com/api/dialogflow", {
        message: input,
        sessionId,
      });

      const responseText = res.data?.responseText;
      const intent = res.data?.intent;

      if (responseText) {
        setMessages((prev) => [...prev, { from: "bot", text: responseText }]);
      } else if (intent === "HoraActual") {
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: `La hora actual es ${new Date().toLocaleTimeString("es-CO", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
              timeZone: "America/Bogota",
            })}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { from: "bot", text: "🤖 No entendí eso, ¿puedes repetirlo?" },
        ]);
      }
    } catch (error) {
      console.error("❌ Error al conectar con el servidor:", error);
      setMessages((prev) => [
        ...prev,
        { from: "bot", text: "⚠️ Ocurrió un error al intentar responderte." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chatdf-container">
      <div className="chatdf-box">
        {messages.map((m, i) => (
          <div key={i} className={`msgdf ${m.from}`}>
            {m.type === "cards" ? (
              <div className="cards-container">
                {m.cards.map((c, index) => (
                  <div key={index} className="card">
                    <img src={c.Imagen} alt={c.Nombre} className="card-img" />
                    <h4>{c.Nombre}</h4>
                    <p>📅 {c.Fecha}</p>
                    <p>⏰ {c.Hora}</p>
                    <p>📍 {c.Lugar || "No especificado"}</p>
                  </div>
                ))}
              </div>
            ) : m.type === "eventCards" ? (
              <div className="cards-container">
                {m.cards.map((c, index) => (
                  <div key={index} className="card">
                    <img src={c.Imagen} alt={c.Nombre} className="card-img" />
                    <h4>{c.Nombre}</h4>
                    <p>📅 {c.Fecha}</p>
                    <p>⏰ {c.Hora}</p>
                    <p>📍 {c.Lugar}</p>
                  </div>
                ))}
              </div>
            ) : (
              <span>{m.text}</span>
            )}
          </div>
        ))}
      </div>

      <div className="chatdf-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Escribe tu mensaje..."
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
};

export default ChatBot;
