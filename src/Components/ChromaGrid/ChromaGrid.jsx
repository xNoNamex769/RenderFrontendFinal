/*
	Installed from https://reactbits.dev/default/
*/

import React ,{ useRef, useEffect } from "react";
import { gsap } from "gsap";
import img1 from "../../pages/Aplicacion/img/img2.jpeg"
import img2 from "../../pages/Aplicacion/img/img2.jpeg"
import img3 from "../../pages/Aplicacion/img/img3.jpg"
import img4 from "../../pages/Aplicacion/img/img4.jpg"
import img5 from "../../pages/Aplicacion/img/img5.jpg"
import img6 from "../../pages/Aplicacion/img/img6.jpg"
import "./ChromaGrid.css";

export const ChromaGrid = ({
  items,
  className = "",
  radius = 300,
  columns = 3,
  rows = 2,
  damping = 0.45,
  fadeOut = 0.6,
  ease = "power3.out",
}) => {
  const rootRef = useRef(null);
  const fadeRef = useRef(null);
  const setX = useRef(null);
  const setY = useRef(null);
  const pos = useRef({ x: 0, y: 0 });

  const demo = [
    {
      image: img1,
      title: "Aprobado",
      subtitle: "Evento dia de la mujer",
      handle: "De:@adminActivSena",
      borderColor: "#4F46E5",
      gradient: "linear-gradient(145deg, #4F46E5, #000)",
     
    },
    {
      image: img2,
      title: "Aprobado",
      subtitle: "Caminata 3 cruces",
      handle: "De:@adminActivsena",
      borderColor: "#10B981",
      gradient: "linear-gradient(210deg, #10B981, #000)",
      
    },
    {
   image: img3,
      title: "Aprobado",
      subtitle: "Dia del deporte",
      handle: "De:@adminActivsena",
      borderColor: "#F59E0B",
      gradient: "linear-gradient(165deg, #F59E0B, #000)",
      
    },
    {
  image: img4,
      title: "Pendiente",
      subtitle: "Dia mundia de la salud",
      handle: "De :@adminActivSena",
      borderColor: "#EF4444",
      gradient: "linear-gradient(195deg, #EF4444, #000)",
     
    },
    {
      image: img5,
      title: "Pendiente",
      subtitle: "Charla policia nacional",
      handle: "De: @adminActivSena",
      borderColor: "#8B5CF6",
      gradient: "linear-gradient(225deg, #8B5CF6, #000)",
      
    },
    {
  image: img6,
      title: "Pendiente",
      subtitle: "Feria universidades",
      handle: "@De: adminActivsena",
      borderColor: "#06B6D4",
      gradient: "linear-gradient(135deg, #06B6D4, #000)",
      
    },
  ];
  const data = items?.length ? items : demo;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    setX.current = gsap.quickSetter(el, "--x", "px");
    setY.current = gsap.quickSetter(el, "--y", "px");
    const { width, height } = el.getBoundingClientRect();
    pos.current = { x: width / 2, y: height / 2 };
    setX.current(pos.current.x);
    setY.current(pos.current.y);
  }, []);

  const moveTo = (x, y) => {
    gsap.to(pos.current, {
      x,
      y,
      duration: damping,
      ease,
      onUpdate: () => {
        setX.current?.(pos.current.x);
        setY.current?.(pos.current.y);
      },
      overwrite: true,
    });
  };

  const handleMove = (e) => {
    const r = rootRef.current.getBoundingClientRect();
    moveTo(e.clientX - r.left, e.clientY - r.top);
    gsap.to(fadeRef.current, { opacity: 0, duration: 0.25, overwrite: true });
  };

  const handleLeave = () => {
    gsap.to(fadeRef.current, {
      opacity: 1,
      duration: fadeOut,
      overwrite: true,
    });
  };

  const handleCardClick = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const handleCardMove = (e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty("--mouse-x", `${x}px`);
    card.style.setProperty("--mouse-y", `${y}px`);
  };

  return (
    <div
      ref={rootRef}
      className={`chroma-grid ${className}`}
      style={
        {
          "--r": `${radius}px`,
          "--cols": columns,
          "--rows": rows,
        }
      }
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
    >
      {data.map((c, i) => (
        <article
          key={i}
          className="chroma-card"
          onMouseMove={handleCardMove}
          onClick={() => handleCardClick(c.url)}
          style={
            {
              "--card-border": c.borderColor || "transparent",
              "--card-gradient": c.gradient,
              cursor: c.url ? "pointer" : "default",
            }
          }
        >
          <div className="chroma-img-wrapper">
            <img src={c.image} alt={c.title} loading="lazy" />
          </div>
          <footer className="chroma-info">
            <h3 className="name">{c.title}</h3>
            {c.handle && <span className="handle">{c.handle}</span>}
            <p className="role">{c.subtitle}</p>
            {c.location && <span className="location">{c.location}</span>}
          </footer>
        </article>
      ))}
      <div className="chroma-overlay" />
      <div ref={fadeRef} className="chroma-fade" />
    </div>
  );
};

export default ChromaGrid;
