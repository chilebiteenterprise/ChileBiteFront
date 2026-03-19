import React from 'react';

// Icono sólido moderno (Stitch/Heroicons)
const FireIconSolid = ({ className, color }) => (
    <svg 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        className={className} 
        style={{ color: color || 'currentColor' }}
    >
        <path fillRule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z" clipRule="evenodd" />
    </svg>
);

const ContenedorFire = ({ selectedDifficulty, setSelectedDifficulty }) => {
    // Array para representar los 5 niveles (1 a 5)
    const levels = [1, 2, 3, 4, 5];

    // Mapeo original de ChileBite (Verde a Rojo) que se retiene como regla estricta
    const colorMap = {
        1: "#4caf50",  // Verde chill
        2: "#8bc34a",  // Verde lima suave
        3: "#ffc107",  // Amarillo/Ambar cálido
        4: "#ff9800",  // Naranja
        5: "#f44336"   // Rojo intenso
    };

    const handleFireClick = (level) => {
        // Al darle clic al nivel, si es el mismo se limpia a 0 (deselecciona todo)
        if (selectedDifficulty === level) {
            setSelectedDifficulty(0);
        } else {
            setSelectedDifficulty(level);
        }
    };

    return (
        <div className="flex gap-2">
            {levels.map((level) => {
                const isActive = level <= selectedDifficulty;
                // Si está activo, obtiene el color dinámico dependiendo del selectedDifficulty total, NO de su propio índice (esta era la lógica original)
                const fireColor = isActive ? colorMap[selectedDifficulty] : null;

                return (
                    <button
                        key={level}
                        className={`p-1 rounded-full transition-all duration-300 transform 
                                    ${isActive ? 'scale-110 drop-shadow-md' : 'hover:scale-105'} 
                                    focus:outline-none`}
                        onClick={() => handleFireClick(level)}
                        title={`Nivel de dificultad ${level}`}
                    >
                        <FireIconSolid 
                            className={`w-7 h-7 transition-colors duration-300 ${!isActive ? 'text-gray-300 dark:text-gray-700' : ''}`}
                            color={fireColor}
                        />
                    </button>
                );
            })}
        </div>
    );
};

export default ContenedorFire;
