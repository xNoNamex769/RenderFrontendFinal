import React, { useState, useEffect } from 'react';
import "./styles/HeroHomeSection.css";
import { Link } from 'react-router-dom';

export default function HeroHomeSection() {
  let images = [
    "url(./img/fondocol.jpg)",
    "url(./img/fondoef.jpg)",
    "url(./img/portada2.jpg)",
  ];
  

  const [currentIndex, setCurrentIndex] = useState(0);

  const moveSlide = (direction) => {
    const totalSlides = images.length;
    setCurrentIndex((prevIndex) => {
      let newIndex = prevIndex + direction;
      if (newIndex < 0) newIndex = totalSlides - 1;
      if (newIndex >= totalSlides) newIndex = 0;
      return newIndex;
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      moveSlide(1);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      id="home" 
      className="hero-section-home" 
      style={{
        backgroundImage: images[currentIndex],
      }}
    >
      <div className="container-home">
        <div className="hero-content-home">
          <div className="hero-subtitle-home">
            PRESENTANDO ACTIV SENA <span>08/10/2025</span>
          </div>
     <h1 className="hero-title-home h1-home">
  El Lugar Donde Tu Aprendizaje  Se Convierte En Una <span className="highlight-home">Experiencia</span>
</h1>


          <div className="hero-actions-home">
          

            <Link to="/Cuenta" className="btn-home btn-primary-home a-home">
              Iniciar Sesión
            </Link>

            <a href="/Cuenta" className="play-btn-home a-home">
              <i className="icon-play-home"></i>
            </a>
          </div>
        </div>
      </div>

      <div className="hero-controls-home">
        <button 
          className="hero-control-home prev-home" 
          id="btn-prev-home"
          onClick={() => moveSlide(-1)}
        >
          <i className="icon-arrow-left-home"></i>
        </button>
        <button 
          className="hero-control-home next-home" 
          id="btn-next-home"
          onClick={() => moveSlide(1)}
        >
          <i className="icon-arrow-right-home i-home"></i>
        </button>
      </div>
    </section>
  );
}
