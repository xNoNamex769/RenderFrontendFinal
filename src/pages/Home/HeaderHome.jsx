import React, {useState} from "react";

import "./styles/HeaderHome.css"
import TrueFocus from "../../TextAnimations/TrueFocus/TrueFocus";
import  imagenlogo from "../../../public/img/logodef.png"

export default function HeaderHome () {

    const [menuDesplegado, setMenuDesplegado] = useState(false)

    const cambiarEstadoMenu = () => {
        setMenuDesplegado(!menuDesplegado)
    }

    return (
        
        <header className="site-header-home">
        
            <div className="container-home">
                <div className="header-wrapper-home">
                        
                    <div className="logo-home">
                        <a href="/" className="a-home home-logo-titulo">
                             <img src={imagenlogo} alt="Volver al Inicio - Logo ActivSe" width={200} height={200}  className="imagenlogo"/>     
                            <span href="#home" onClick={cambiarEstadoMenu} className="active a-home">ActivSena</span>
                        </a>
                    </div>
                    
                    
                    <nav className="main-nav-home">
                        <button className={`menu-toggle-home ${menuDesplegado ? "active": ""} ` } id="menuToggle" onClick={cambiarEstadoMenu} aria-expanded={!menuDesplegado ? "true" : "false"}>
                            <span className="bar-home"></span>
                            <span className="bar-home"></span>
                            <span className="bar-home"></span>
                        </button>
                        
                        <ul className={`ul-home nav-menu-home ${menuDesplegado ? "active": ""} ` } id="navMenu">
                            <li className="li-home"><a href="/" onClick={cambiarEstadoMenu} className="active a-home">INICIO</a></li>
                            <li className="li-home"><a href="/#about" onClick={cambiarEstadoMenu} className="a-home">NOSOTROS</a></li>
                            <li className="li-home"><a href="/#anuncios" onClick={cambiarEstadoMenu} className="active a-home">ANUNCIOS</a></li>
                            <li className="li-home"><a href="/#projects" onClick={cambiarEstadoMenu} className="a-home">PROYECTOS</a></li>
                            <li className="li-home"><a href="/apoyo-sostenimiento" onClick={cambiarEstadoMenu} className="active a-home">APOYOS DE SOSTENIMIENTO</a></li>
                            <li className="li-home"><a href="/#contact" onClick={cambiarEstadoMenu} className="a-home">CONTACTO</a></li>
                        </ul>
                    </nav>
                </div>
            </div>
        </header>
    )
}