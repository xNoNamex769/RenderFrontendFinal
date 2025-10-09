import React, { useState, useEffect, useRef } from "react";
import "./styles/ChatStyle.css";


const BOT = "bot";
const USER = "user";

const initialMessages = [
  {
    text: "¡Hola zunga! Soy ActivBot 🤖 ¿Cómo estás? ¿En qué puedo ayudarte hoy?",
    sender: BOT,
  },
];

export default function ChatAI() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [history, setHistory] = useState([]);
  const messagesEndRef = useRef(null);

  // Simular una respuesta del bot con texto dinámico básico
  const getBotResponse = (userText) => {
    const lowerText = userText.toLowerCase();

    if (lowerText.includes("hola") || lowerText.includes("buenas")) {
      return "¡Hola! ¿En qué puedo ayudarte hoy? 😊";
    } else if (lowerText.includes("ayuda") || lowerText.includes("necesito")) {
      return "Claro, dime más detalles para poder ayudarte. 🛟";
    } else if (lowerText.includes("gracias")) {
      return "¡De nada! 💚 Estoy aquí para ti.";
    }

    return "¡Un gusto conocerte! 😊 Estoy aquí para ayudarte.";
  };

  const sendMessage = (customMessage = null) => {
    const messageToSend = customMessage || input.trim();
    if (!messageToSend) return;

    const userMessage = { text: messageToSend, sender: USER };
    setMessages((prev) => [...prev, userMessage]);

    setHistory((prev) =>
      prev.includes(messageToSend) ? prev : [...prev, messageToSend]
    );

    setInput("");

    // Respuesta automática del bot
    setTimeout(() => {
      const botReply = { text: getBotResponse(messageToSend), sender: BOT };
      setMessages((prev) => [...prev, botReply]);
    }, 800);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  // Auto-scroll al final del chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-container">
      <div className="chat-box">
        <div className="chat-header">
        <img src="/robotica.png" alt="Bot" className="chat-logo" />

          <h2 className="chat-title">ACTIV BOT</h2>
        </div>

        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message-wrapper ${msg.sender}`}>
              <div className="avatar">{msg.sender === BOT ? "🤖" : "🧑‍💻"}</div>
              <div className={`message ${msg.sender}`}>{msg.text}</div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-container">
          <input
            className="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe un mensaje..."
          />
          <button className="send-button" onClick={() => sendMessage()}>
            ➤
          </button>
        </div>
      </div>

      <div className="history-box">
        <h3>📜 Historial</h3>
        <ul className="history-list">
          {history.map((q, idx) => (
            <li
              key={idx}
              onClick={() => sendMessage(q)}
              className="history-item"
            >
              📝 {q}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
