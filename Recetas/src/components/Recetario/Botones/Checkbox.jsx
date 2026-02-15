// src/components/Botones/Checkbox.jsx

import React, { useState } from "react";
import "./Checkbox.css";

const Checkbox = ({ liked: initialLiked = false, onToggle }) => {
  const [liked, setLiked] = useState(initialLiked);

  const handleClick = () => {
    // CLAVE: Aquí no hay e.stopPropagation(), solo lógica de estado
    setLiked(!liked);
    if (onToggle) onToggle(!liked);
  };

  return (
    // CLAVE: Añadir data-receta-ignore="true" al contenedor para que RecetaCard lo detecte
    <div className="checkbox-wrapper" onClick={handleClick} data-receta-ignore="true"> 
      <div className={`heart ${liked ? "liked" : ""}`}></div>
    </div>
  );
};

export default Checkbox;