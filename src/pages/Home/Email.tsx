import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

const FormComponent: React.FC = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("https://render-hhyo.onrender.com/api/enviarcorreo/enviar-correo", formData);

     toast.success(response.data.msg || "Mensaje enviado con éxito ", {
        duration: 3000,
      });
      setFormData({ name: "", email: "", message: "" });
    } catch (error: any) {
      console.error(error);
      toast.error(" Error al enviar el mensaje. Inténtalo nuevamente.", {
        duration: 3000,
      });
    
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-contact">
      <input
        type="text"
        name="name"
        placeholder="Tu nombre"
        value={formData.name}
        onChange={handleChange}
        required
      />
      <input
        type="email"
        name="email"
        placeholder="Tu correo"
        value={formData.email}
        onChange={handleChange}
        required
      />
      <textarea
        name="message"
        placeholder="Tu mensaje"
        value={formData.message}
        onChange={handleChange}
        required
      ></textarea>

      <button type="submit" disabled={loading}>
        {loading ? "Enviando..." : "Enviar mensaje"}
      </button>
    </form>
  );
};

export default FormComponent;
