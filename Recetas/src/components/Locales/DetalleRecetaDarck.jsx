import React, { useState } from 'react';
import { Clock, Users, Heart, Share2, ArrowLeft, Utensils, Zap, Lightbulb } from 'lucide-react'; 

const COLOR_PRINCIPAL = '#e0a960'; 
const COLOR_FONDO = '#1e1e1e';   
const COLOR_CARD = '#2c2c2c';      
const MOCK_RECETA = {
    id: 42,
    nombre: "Tacos Al Pastor Clásicos",
    descripcion_larga: "Una receta tradicional de la Ciudad de México con carne de cerdo marinada en achiote y especias, servida con piña, cebolla y cilantro. ¡Perfecta para cualquier celebración! Esta versión garantiza el sabor auténtico con la comodidad de hacerlo en casa.",
    imagen_url: "https://images.unsplash.com/photo-1555561081-3e4428e3ed3c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    video_url: "https://www.youtube.com/embed/dQw4w9WgXcQ?si=73QJz9j4B-z0x1T6",
    dificultad: "Media",
    numero_porcion: 6,
    ingredientes: "1 kg de carne de cerdo\n4 chiles guajillos\n2 chiles anchos\n1/2 taza de vinagre\n1 cucharada de achiote\n1/2 piña fresca",
    preparacion: "1. Marina la carne con los chiles y especias por 4 horas.\n2. Cocina la carne en una sartén caliente o en asador.\n3. Calienta las tortillas y sirve la carne con piña, cebolla y cilantro.\n4. ¡Disfruta con tu salsa favorita!",
    usuario: "Chef Juan Pérez",
};

const parseTextToList = (text) => {
    if (!text || typeof text !== 'string') return [];
    return text.split('\n').map(item => item.trim()).filter(item => item.length > 0);
};


// --- Componente Principal ---
export default function DetalleRecetaDark() {
    const [isFavorite, setIsFavorite] = useState(false); 
    const receta = MOCK_RECETA; 
    const navigateBack = () => window.history.back(); 

    const ingredientesArray = parseTextToList(receta.ingredientes);
    const instruccionesArray = parseTextToList(receta.preparacion); 
    const tiempoTotal = "1 hora 30 min"; 

    const handleFavorite = () => setIsFavorite(!isFavorite);
    const handleShare = () => alert(`Compartiendo la receta de ${receta.nombre}`);

    return (
        <div className="min-h-screen pt-0 md:pt-12" style={{ backgroundColor: COLOR_FONDO, color: 'white' }}>
            
            <div className="relative w-full h-[60vh] md:h-[500px] overflow-hidden">
                
                {/* Imagen del Banner */}
                <img
                    src={receta.imagen_url}
                    alt={receta.nombre}
                    className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-80"></div>

                {/* Contenido Fijo */}
                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between">
                    
                    {/* Controles Superiores */}
                    <div className="flex justify-between items-start w-full">
                        <button
                            onClick={navigateBack}
                            className="flex items-center gap-2 text-white hover:text-gray-300 transition-colors bg-black bg-opacity-30 p-2 rounded-full"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Volver
                        </button>
                        <div className="flex gap-3">
                            <button
                                onClick={handleFavorite}
                                className={`p-3 rounded-full transition-colors ${isFavorite ? 'bg-red-600 text-white' : 'bg-black bg-opacity-50 text-white hover:bg-opacity-70'}`}
                                title="Guardar en favoritos"
                            >
                                <Heart className="w-6 h-6 fill-current" />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-3 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-colors"
                                title="Compartir"
                            >
                                <Share2 className="w-6 h-6" />
                            </button>
                        </div>
                    </div>
                    
                    {/* Título Inferior */}
                    <div className="max-w-4xl mx-auto w-full text-center">
                        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-tight mb-2 text-shadow-lg" style={{ color: 'white' }}>
                            {receta.nombre}
                        </h1>
                        <p className="text-lg italic opacity-80">Por: {receta.usuario}</p>
                    </div>
                </div>
            </div>
            <div className="max-w-4xl mx-auto -mt-10 relative z-10 px-4 md:px-0">
                <div className="bg-white rounded-xl shadow-2xl p-6 mb-12 grid grid-cols-3 gap-6 transform translate-y-0 border-t-4" style={{ backgroundColor: COLOR_CARD, borderColor: COLOR_PRINCIPAL }}>
                    <div className="text-center">
                        <Clock className="w-6 h-6 mx-auto mb-2" style={{ color: COLOR_PRINCIPAL }} />
                        <p className="text-sm text-gray-400">Tiempo</p>
                        <p className="font-bold text-lg text-white">{tiempoTotal}</p>
                    </div>
                    <div className="text-center">
                        <Users className="w-6 h-6 mx-auto mb-2" style={{ color: COLOR_PRINCIPAL }} />
                        <p className="text-sm text-gray-400">Porciones</p>
                        <p className="font-bold text-lg text-white">{receta.numero_porcion}</p>
                    </div>
                    <div className="text-center">
                        <Zap className="w-6 h-6 mx-auto mb-2" style={{ color: COLOR_PRINCIPAL }} />
                        <p className="text-sm text-gray-400">Dificultad</p>
                        <p className="font-bold text-lg text-white">{receta.dificultad}</p>
                    </div>
                </div>

                {/* Sección de Descripción */}
                <section className="mb-12 px-2">
                    <h2 className="text-2xl font-bold mb-4" style={{ color: COLOR_PRINCIPAL }}>Introducción</h2>
                    <p className="text-lg leading-relaxed text-gray-300">
                        {receta.descripcion_larga}
                    </p>
                </section>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 bg-black bg-opacity-30 rounded-xl p-6 md:p-10 shadow-inner">
                    
                    {/* Ingredientes */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: COLOR_PRINCIPAL }}>
                            <Utensils className="w-6 h-6" /> Ingredientes
                        </h2>
                        <ul className="space-y-4 text-gray-300">
                            {ingredientesArray.map((ing, index) => (
                                <li key={index} className="flex items-start gap-3 border-b border-gray-700 pb-2">
                                    <span className="text-lg font-medium">{ing}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Preparación */}
                    <div>
                        <h2 className="text-3xl font-bold mb-6 flex items-center gap-3" style={{ color: COLOR_PRINCIPAL }}>
                            <Zap className="w-6 h-6" /> Pasos
                        </h2>
                        <ol className="list-none space-y-6 text-gray-300">
                            {instruccionesArray.map((inst, index) => (
                                <li key={index} className="pl-6 relative border-l-2" style={{ borderColor: COLOR_PRINCIPAL }}>
                                    <span className="absolute left-0 top-0 w-4 h-4 rounded-full border-2" style={{ borderColor: COLOR_PRINCIPAL, backgroundColor: COLOR_FONDO }}></span>
                                    <span className="font-bold text-xl block mb-1" style={{ color: COLOR_PRINCIPAL }}>Paso {index + 1}</span> 
                                    <p className="text-base">{inst}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>

                {/* Video y Tips */}
                {receta.video_url && (
                    <section className="mt-12">
                        <h2 className="text-3xl font-bold mb-4" style={{ color: COLOR_PRINCIPAL }}>Video Tutorial</h2>
                        <div className="aspect-w-16 aspect-h-9 relative h-0 pb-[56.25%]"> 
                            <iframe 
                                src={receta.video_url} 
                                frameBorder="0" 
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                                allowFullScreen
                                className="rounded-xl shadow-2xl absolute top-0 left-0 w-full h-full border-4 border-gray-800"
                            ></iframe>
                        </div>
                    </section>
                )}

                {/* Tips del Chef (Lightbulb) */}
                <div className="mt-12 p-6 rounded-xl border-4 shadow-lg" style={{ borderColor: COLOR_PRINCIPAL + '40', backgroundColor: '#333' }}>
                    <h3 className="text-2xl font-bold mb-3 flex items-center gap-2" style={{ color: COLOR_PRINCIPAL }}>
                        <Lightbulb className="w-6 h-6 fill-current" /> Consejos
                    </h3>
                    <p className="text-gray-300 italic">
                        *Sugerencia del autor*: Si buscas una textura más crujiente, hornea la piña 5 minutos extra al final. ¡Recuerda siempre usar un buen corte de carne para asegurar la jugosidad!
                    </p>
                </div>
            </div>

            {/* Pie de página de Recetas Relacionadas (Fondo oscuro) */}
            <div className="mt-12 py-10" style={{ backgroundColor: COLOR_FONDO }}>
                <div className="max-w-4xl mx-auto px-4">
                    <h2 className="text-2xl font-bold mb-6 text-white">Más Recetas Premium</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-400">Relacionada A</div>
                        <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-400">Relacionada B</div>
                        <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-400">Relacionada C</div>
                        <div className="h-32 bg-gray-800 rounded-lg flex items-center justify-center text-sm text-gray-400">Relacionada D</div>
                    </div>
                </div>
            </div>

        </div>
    );
}