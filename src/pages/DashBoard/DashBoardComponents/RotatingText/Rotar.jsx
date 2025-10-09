import React from "react";
import RotatingText from "./RotatingText";


export default function RotatingTextWrapper() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily:"arial",
        minHeight: "200px",
     
       
       
        
        marginRight:"60px"

      }}
    >
        <header className="texto-activsena">ActivSena</header>
      <RotatingText
      
        texts={["¡Conecta!", "¡Gestiona!", "¡Aprende!", "¡Diviertete!"] }
        mainClassName="rotating-text-main texto-activ"
        splitLevelClassName="rotating-text-split-level"
        rotationInterval={2000}
      />
    </div>
  );
}
