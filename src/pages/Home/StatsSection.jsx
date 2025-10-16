import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaUsers, FaCalendarCheck, FaStar, FaChalkboardTeacher } from 'react-icons/fa';
import { MdEventAvailable } from 'react-icons/md';
import './styles/StatsSection.css';

export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    aprendices: 0,
    eventos: 0,
    satisfaccion: 0,
    instructores: 0,
    loading: true
  });
  const sectionRef = useRef(null);

  // Obtener datos reales de la API
  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Obtener total de aprendices desde el endpoint correcto
        const aprendicesRes = await axios.get('https://render-hhyo.onrender.com/api/aprendices/listar');
        const aprendicesData = Array.isArray(aprendicesRes.data) ? aprendicesRes.data : aprendicesRes.data?.aprendices ?? [];
        const totalAprendices = aprendicesData.length;

        // Obtener total de eventos
        const eventosRes = await axios.get('https://render-hhyo.onrender.com/api/evento/publicos');
        const totalEventos = eventosRes.data.length;

        // Obtener feedbacks para calcular satisfacción promedio
        let satisfaccionPromedio = 95; // Default si no hay feedbacks
        try {
          const feedbacksRes = await axios.get('https://render-hhyo.onrender.com/api/feedback');
          if (feedbacksRes.data && feedbacksRes.data.length > 0) {
            const suma = feedbacksRes.data.reduce((acc, fb) => acc + (fb.calificacion || 0), 0);
            satisfaccionPromedio = Math.round((suma / feedbacksRes.data.length / 5) * 100);
          }
        } catch (error) {
          console.log('No hay feedbacks disponibles, usando valor por defecto');
        }

        // Obtener total de instructores
        const instructoresRes = await axios.get('https://render-hhyo.onrender.com/api/usuario');
        const totalInstructores = instructoresRes.data.filter(u => u.IdRol === 3).length; // Rol 3 = Instructor

        setStats({
          aprendices: totalAprendices,
          eventos: totalEventos,
          satisfaccion: satisfaccionPromedio,
          instructores: totalInstructores,
          loading: false
        });

        console.log('📊 Estadísticas REALES cargadas desde la BD:', {
          aprendices: `${totalAprendices} (desde /api/aprendices/listar)`,
          eventos: `${totalEventos} (desde /api/evento/publicos)`,
          satisfaccion: `${satisfaccionPromedio}% (calculado desde feedbacks)`,
          instructores: `${totalInstructores} (usuarios con IdRol=3)`
        });

      } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
        // Usar valores por defecto si falla la API
        setStats({
          aprendices: 2500,
          eventos: 150,
          satisfaccion: 95,
          instructores: 50,
          loading: false
        });
      }
    };

    fetchStats();
  }, []);

  // Detectar cuando la sección entra en el viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="stats-container">
        <div className="stats-header">
          <h2 className="stats-title">Nuestra Comunidad </h2>
          <p className="stats-subtitle">
            Más que estadísticas, somos una comunidad activa y comprometida con el aprendizaje
          </p>
        </div>

        <div className="stats-grid">
          <StatCard
            icon={<FaUsers />}
            number={stats.aprendices}
            suffix="+"
            label="Aprendices Activos"
            color="#5eb319"
            isVisible={isVisible}
            delay={0}
            loading={stats.loading}
          />
          
          <StatCard
            icon={<MdEventAvailable />}
            number={stats.eventos}
            suffix="+"
            label="Eventos Realizados"
            color="#3a7d13"
            isVisible={isVisible}
            delay={200}
            loading={stats.loading}
          />
          
          <StatCard
            icon={<FaStar />}
            number={stats.satisfaccion}
            suffix="%"
            label="Satisfacción"
            color="#5eb319"
            isVisible={isVisible}
            delay={400}
            loading={stats.loading}
          />
          
          <StatCard
            icon={<FaChalkboardTeacher />}
            number={stats.instructores}
            suffix="+"
            label="Instructores"
            color="#3a7d13"
            isVisible={isVisible}
            delay={600}
            loading={stats.loading}
          />
        </div>
      </div>
    </section>
  );
}

// Componente individual de estadística con animación
function StatCard({ icon, number, suffix, label, color, isVisible, delay, loading }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    const duration = 2000; // 2 segundos
    const steps = 60;
    const increment = number / steps;
    let current = 0;

    const timer = setTimeout(() => {
      const counter = setInterval(() => {
        current += increment;
        if (current >= number) {
          setCount(number);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, number, delay]);

  return (
    <div 
      className={`stat-card ${isVisible ? 'stat-card-visible' : ''} ${loading ? 'stat-card-loading' : ''}`}
      style={{ 
        animationDelay: `${delay}ms`,
        borderColor: color 
      }}
    >
      <div className="stat-icon-wrapper" style={{ backgroundColor: `${color}15` }}>
        <div className="stat-icon" style={{ color: color }}>
          {icon}
        </div>
      </div>
      
      <div className="stat-content">
        <div className="stat-number" style={{ color: color }}>
          {loading ? (
            <span className="stat-skeleton">...</span>
          ) : (
            <>{count.toLocaleString()}{suffix}</>
          )}
        </div>
        <div className="stat-label">{label}</div>
      </div>
      
      <div className="stat-decoration" style={{ backgroundColor: color }}></div>
    </div>
  );
}
