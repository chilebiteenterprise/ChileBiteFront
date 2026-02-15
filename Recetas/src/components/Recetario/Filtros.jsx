import React from "react";
import ContenedorFire from "./Botones/ContenedorFire";
import "./Filtros.css";

const categorias = [
  { name: "Postre", color: "bg-pink-400 text-white" },
  { name: "Almuerzo", color: "bg-green-400 text-white" },
  { name: "Cena", color: "bg-blue-400 text-white" },
  { name: "Ensalada", color: "bg-red-400 text-white" },
  { name: "Desayuno", color: "bg-yellow-400 text-black" },
  { name: "Snack", color: "bg-purple-400 text-white" },
  { name: "Entrada", color: "bg-orange-400 text-white" },
  { name: "Sopa", color: "bg-teal-400 text-white" },
  { name: "Bebida", color: "bg-indigo-400 text-white" },
  { name: "Acompañamiento", color: "bg-lime-400 text-black" },
  { name: "Panadería", color: "bg-rose-400 text-white" },
];

const porciones = ["1", "2", "3", "4", "5", "6"];

const Filtros = ({
  selectedCategories,
  setSelectedCategories,
  selectedPortions,
  setSelectedPortions,
  selectedCountry,
  setSelectedCountry,
  selectedDifficulty,
  setSelectedDifficulty,
  resetFilters,
}) => {
  const toggleCategory = (cat) => {
    if (selectedCategories.includes(cat)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== cat));
    } else {
      setSelectedCategories([...selectedCategories, cat]);
    }
  };

  const togglePortion = (p) => {
    if (selectedPortions.includes(p)) {
      setSelectedPortions(selectedPortions.filter((x) => x !== p));
    } else {
      setSelectedPortions([...selectedPortions, p]);
    }
  };

  return (
    <aside className="fixed top-16 left-0 h-[calc(100vh-4rem)] w-[300px] overflow-y-auto p-4 bg-gray-50 shadow-md rounded-r-xl flex flex-col gap-6 z-30">
      <h2 className="text-xl font-bold text-gray-800 sticky top-0 bg-gray-50 z-10 pb-4 border-b border-gray-200">
        Filtros
      </h2>

      {/* País */}
      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-700 mb-2">País</h3>
        <div className="relative">
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="input w-full rounded-full px-8 py-3 border-2 border-transparent focus:outline-none focus:border-blue-500 placeholder-gray-400 transition-all duration-300 shadow-md appearance-none bg-white cursor-pointer">
            <option value="">Selecciona un país</option>
            <option value="Argentina">Argentina</option>
            <option value="Chile">Chile</option>
            <option value="Mexico">México</option>
            <option value="España">España</option>
          </select>

          {/* Flecha personalizada */}
          <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
            <svg
              className="w-4 h-4 text-gray-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Dificultad */}
      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-700 mb-2">Dificultad</h3>
        <ContenedorFire
          selectedDifficulty={selectedDifficulty}
          setSelectedDifficulty={setSelectedDifficulty}
        />
      </div>

      {/* Categorías */}
      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-700 mb-2">Categoría</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scroll-smooth py-2">
          {categorias.map((c) => (
            <button
              key={c.name}
              className={`${c.color} rounded-full px-4 py-1 ${
                selectedCategories.includes(c.name) ? "scale-105 shadow-md" : ""
              }`}
              onClick={() => toggleCategory(c.name)}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Porciones con CSS puro */}

      <div className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-shadow">
        <h3 className="font-semibold text-gray-700 mb-2">Porciones</h3>
        <div className="flex gap-2 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scroll-smooth py-2 ">
          <div className="flex w-full gap-2 porciones-container">
            {porciones.map((p) => (
              <button
                key={p}
                className={`flex-1 porcion-btn ${
                  selectedPortions.includes(p) ? "selected" : ""
                } `}
                onClick={() => togglePortion(p)}>
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reset */}
      <button
        className="w-full py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors mt-4"
        onClick={resetFilters}>
        Restablecer filtros
      </button>
    </aside>
  );
};

export default Filtros;
