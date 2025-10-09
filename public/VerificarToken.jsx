import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../src/services/api';
import './styles/Token.css';

const VerificarToken = () => {
  const [token, setToken] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const correo = localStorage.getItem('correoValidacion');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/usuario/confirm-account', { correo, token });
      setMensaje('✅ Verificación exitosa. Puedes iniciar sesión');
      setTimeout(() => navigate('/Cuenta'), 2000);
    } catch (error) {
      console.error(error);
      setMensaje('❌ Token incorrecto o expirado');
    }
  };

  return (
    <div className="token-container">
      <h2 className="token-title">Verifica en tu correo tu token!</h2>
      <form className="token-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="token-input"
          placeholder="Ingresa el token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <button type="submit" className="token-button">Verificar</button>
      </form>
      {mensaje && <p className="token-message">{mensaje}</p>}
    </div>
  );
};

export default VerificarToken;
