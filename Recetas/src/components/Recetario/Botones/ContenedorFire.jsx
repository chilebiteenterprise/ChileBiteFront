import React, { useEffect } from "react";
import Fire from "./Fire.jsx";

const ContenedorFire = ({ selectedDifficulty, setSelectedDifficulty }) => {
  const colors = ["green", "#A4C639", "yellow", "orange", "red"];

  // Actualiza los fuegos al cambiar selectedDifficulty (incluyendo reset)
  useEffect(() => {
    const fires = document.querySelectorAll(".difficulty-selector > div");
    fires.forEach((fire, index) => {
      fire.style.setProperty(
        "--fire-color",
        index < selectedDifficulty ? colors[index] : "#f5f5f5"
      );
    });
  }, [selectedDifficulty]);

  const handleClick = (index) => {
    setSelectedDifficulty(index + 1);
  };

  return (
    <div className="difficulty-selector flex gap-3 justify-center items-center">
      {colors.map((color, index) => (
        <div
          key={index}
          onClick={() => handleClick(index)}
          onMouseEnter={(e) => {
            const fires = e.currentTarget.parentNode.children;
            for (let i = 0; i <= index; i++) {
              fires[i].style.setProperty("--fire-color", colors[i]);
            }
          }}
          onMouseLeave={(e) => {
            const fires = e.currentTarget.parentNode.children;
            for (let i = 0; i < fires.length; i++) {
              fires[i].style.setProperty(
                "--fire-color",
                i < selectedDifficulty ? colors[i] : "#f5f5f5"
              );
            }
          }}>
          <Fire
            color={index < selectedDifficulty ? colors[index] : "#f5f5f5"}
          />
        </div>
      ))}
    </div>
  );
};

export default ContenedorFire;
