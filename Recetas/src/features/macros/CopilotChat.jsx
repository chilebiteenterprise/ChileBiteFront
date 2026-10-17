import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles } from 'lucide-react';

export default function CopilotChat({ isOpen, onClose, onAdd, onClear, onSetRecipeName, onSetRecipeSteps }) {
  const { session } = useAuth();
  const [message, setMessage] = useState('');
  const [expandedRecipeIndex, setExpandedRecipeIndex] = useState({});
  const [history, setHistory] = useState([
    {
      role: 'assistant',
      content: {
        tipo: 'texto',
        mensaje: '¡Hola! Soy tu Chef IA. Dime qué tienes en el refri o qué te gustaría comer hoy y te prepararé opciones saludables.'
      }
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [usingRecipe, setUsingRecipe] = useState(false);
  const [usage, setUsage] = useState({ current: 0, max: 10 });
  const messagesEndRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('chefIA_history');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Error parsing history', e);
      }
    }
  }, []);

  // Save history to localStorage on change
  useEffect(() => {
    localStorage.setItem('chefIA_history', JSON.stringify(history));
  }, [history]);

  // Load initial usage
  useEffect(() => {
    if (session && isOpen) {
      fetch('/api/copilot', {
        headers: { 'Authorization': `Bearer ${session.access_token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data.usage !== undefined) {
          setUsage({ current: data.usage, max: data.max });
        }
      })
      .catch(console.error);
    }
  }, [session, isOpen]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [history, loading]);

  const handleSend = async () => {
    if (!message.trim() || !session || loading || usage.current >= usage.max) return;
    
    const userMsg = message.trim();
    setMessage('');
    
    const newHistory = [...history, { role: 'user', content: userMsg }];
    setHistory(newHistory);
    setLoading(true);

    try {
      const response = await fetch('/api/copilot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          // Send previous history mapped nicely for the backend
          history: history.map(h => ({
            role: h.role,
            // Since backend expects text, we stringify the object if it's from the assistant
            content: typeof h.content === 'string' ? h.content : JSON.stringify(h.content)
          })),
          message: userMsg
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la petición');
      }

      setUsage({ current: data.usage, max: data.max });
      setHistory(prev => [...prev, { role: 'assistant', content: data.response }]);

    } catch (error) {
      console.error(error);
      setHistory(prev => [...prev, { role: 'assistant', content: { tipo: 'texto', mensaje: `Error: ${error.message}` } }]);
    } finally {
      setLoading(false);
    }
  };

  const handleUseRecipe = async (recipe) => {
    if (!recipe || !recipe.ingredientes || usingRecipe) return;
    
    setUsingRecipe(true);
    try {
      // 1. Limpiar calculadora actual e indicar el nombre y pasos de la receta
      if (onClear) onClear();
      if (onSetRecipeName) onSetRecipeName(recipe.nombre);
      if (onSetRecipeSteps && recipe.pasos) onSetRecipeSteps(recipe.pasos);

      // 2. Por cada ingrediente, buscar en la BD (core_ingrediente)
      for (const ing of recipe.ingredientes) {
        if (!ing.nombre) continue;

        // 2a. Buscar hasta 10 candidatos que coincidan parcialmente
        let { data } = await supabase
          .from('core_ingrediente')
          .select('*')
          .ilike('nombre', `%${ing.nombre}%`)
          .limit(10);

        const cleanedLower = ing.nombre
          .replace(/\(.*?\)/g, '') // Eliminar descripciones entre paréntesis
          .toLowerCase()
          .trim();

        // 2b. Búsqueda inteligente de fallback si falla la coincidencia directa
        if (!data || data.length === 0) {
          const stopWords = new Set([
            'de', 'en', 'con', 'para', 'al', 'del', 'los', 'las', 'un', 'una', 'y', 'o',
            'cortada', 'cortado', 'cortadas', 'cortados', 'tiras', 'trozo', 'trozos',
            'mediana', 'mediano', 'medianas', 'medianos', 'entero', 'entera', 'enteros',
            'rayado', 'rallado', 'picado', 'picada', 'picados', 'picadas', 'en', 'tiras',
            'grado', '1', '2', '3', '4', 'a', 'la', 'el'
          ]);

          const words = cleanedLower.split(/\s+/).map(w => w.trim()).filter(w => w && !stopWords.has(w));
          if (words.length > 0) {
            const searchWord = words[0]; // Palabra principal
            const { data: fallbackData } = await supabase
              .from('core_ingrediente')
              .select('*')
              .ilike('nombre', `%${searchWord}%`)
              .limit(10);
            
            if (fallbackData && fallbackData.length > 0) {
              data = fallbackData;
            }
          }
        }

        // 2c. Clasificar y ordenar candidatos para encontrar la mejor coincidencia semántica
        if (data && data.length > 0) {
          const searchWords = cleanedLower.split(/\s+/).filter(w => w.length > 2);
          
          data.sort((a, b) => {
            const nameA = a.nombre.toLowerCase();
            const nameB = b.nombre.toLowerCase();

            // Prioridad 1: Coincidencia exacta
            const exactA = nameA === cleanedLower;
            const exactB = nameB === cleanedLower;
            if (exactA && !exactB) return -1;
            if (!exactA && exactB) return 1;

            // Prioridad 2: Comienza con la palabra de búsqueda
            const startsA = nameA.startsWith(cleanedLower);
            const startsB = nameB.startsWith(cleanedLower);
            if (startsA && !startsB) return -1;
            if (!startsA && startsB) return 1;

            // Prioridad 3: Coincidencia de palabra completa (evita que "papa" coincida con "papaya")
            if (searchWords.length > 0) {
              const regex = new RegExp(`\\b${searchWords[0]}\\b`, 'i');
              const wordA = regex.test(nameA);
              const wordB = regex.test(nameB);
              if (wordA && !wordB) return -1;
              if (!wordA && wordB) return 1;
            }

            // Prioridad 4: El nombre más corto (ej. prefiere "Papa (mediana)" ante "Panqueque de papa")
            return nameA.length - nameB.length;
          });

          const foundIng = data[0];
          // 3. Añadir a la calculadora con la cantidad y unidad sugeridas por la IA
          let rawUnit = (ing.unidad || '').toLowerCase().trim();
          let unit = 'g';
          if (rawUnit.startsWith('gram') || rawUnit === 'gr' || rawUnit === 'g') unit = 'g';
          else if (rawUnit.startsWith('kilo') || rawUnit === 'kg') unit = 'kg';
          else if (rawUnit.startsWith('mili') || rawUnit === 'ml' || rawUnit === 'cc') unit = 'ml';
          else if (rawUnit.startsWith('litr') || rawUnit === 'l' || rawUnit === 'lt') unit = 'l';
          else if (rawUnit.startsWith('unid') || rawUnit.startsWith('ud') || rawUnit.startsWith('piez') || rawUnit === 'u') unit = 'unidad';
          else if (rawUnit.startsWith('taz') || rawUnit === 'tz') unit = 'taza';
          else if (rawUnit.startsWith('cucharadita') || rawUnit === 'cdta') unit = 'cda';
          else if (rawUnit.startsWith('cucharada') || rawUnit === 'cda') unit = 'cda';
          else if (foundIng.tipo_medida === 'volumen') unit = 'ml';
          else if (foundIng.tipo_medida === 'unidad') unit = 'unidad';

          const qty = ing.cantidad || ing.gramos || (unit === 'unidad' ? 1 : unit === 'ml' ? 200 : 100);
          if (onAdd) {
            onAdd(foundIng, qty, unit);
          }
        } else {
          console.warn(`Ingrediente no encontrado en BD: ${ing.nombre}`);
        }
      }
      
      onClose();
    } finally {
      setUsingRecipe(false);
    }
  };

  const toggleExpandRecipe = (key) => {
    setExpandedRecipeIndex(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <>
      {/* Backdrop para móviles o si queremos tapar el resto */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity duration-500 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } lg:hidden`}
        onClick={onClose}
      />

      {/* Drawer desplegable */}
      <div 
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] z-50 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } bg-[#19120f]/80 backdrop-blur-[20px] border-l border-white/10 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col text-[#efdfd9]`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold font-['Inter'] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#b08968]" /> Chef IA
            </h2>
            <p className="text-sm text-[#dac1b8]">Tu asistente de cocina inteligente</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => {
                setHistory([{ role: 'assistant', content: { tipo: 'texto', mensaje: '¡Hola! Soy tu Chef IA. Dime qué tienes en el refri o qué te gustaría comer hoy y te prepararé opciones saludables.' } }]);
              }}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-gray-400 hover:text-white"
              title="Limpiar chat"
              aria-label="Limpiar chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
              title="Cerrar Chef IA"
              aria-label="Cerrar Chef IA"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Usage Badge / Limits */}
        <div className="px-6 py-3 bg-white/5 border-b border-white/10 flex items-center justify-between text-sm">
          <span className="text-[#dac1b8]">Uso diario: {usage.current}/{usage.max} consultas</span>
          <div className="w-24 h-1.5 bg-[#261e1a] rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#A0522D] rounded-full shadow-[0_0_8px_#A0522D] transition-all duration-500" 
              style={{ width: `${(usage.current / usage.max) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {history.map((msg, i) => {
            const isUser = msg.role === 'user';
            return (
            <div key={i} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[95%] rounded-[16px] p-4 ${
                  isUser 
                    ? 'bg-[#261e1a] text-[#efdfd9] rounded-br-sm' 
                    : 'bg-[#19120f]/60 border-l-2 border-[#A0522D] text-[#efdfd9] rounded-tl-sm shadow-md'
                }`}
              >
                {isUser ? (
                  <p className="text-[15px] leading-relaxed font-['Inter']">{msg.content}</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {msg.content.tipo === 'texto' && (
                       <p className="text-[15px] leading-relaxed font-['Inter']">{msg.content.mensaje}</p>
                    )}
                    
                    {msg.content.tipo === 'opciones' && msg.content.opciones?.map((recipe, idx) => {
                      const recipeKey = `${i}-${idx}`;
                      const isExpanded = expandedRecipeIndex[recipeKey] ?? false;

                      return (
                      <div key={idx} className="bg-[#261e1a] p-4 rounded-xl border border-white/10 hover:border-[#A0522D]/50 transition-colors group flex flex-col gap-3">
                        <div>
                          <h4 className="font-bold text-white mb-1 text-base">{recipe.nombre}</h4>
                          <p className="text-xs text-[#dac1b8]">{recipe.descripcion}</p>
                        </div>

                        {/* Toggle expand btn */}
                        <button 
                          type="button"
                          onClick={() => toggleExpandRecipe(recipeKey)}
                          className="flex items-center justify-between text-xs font-semibold text-[#b08968] hover:text-[#d4906a] transition-colors pt-1 border-t border-white/5"
                        >
                          <span>{isExpanded ? 'Ocultar receta' : 'Ver ingredientes y preparación'}</span>
                          <svg className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {isExpanded && (
                          <div className="flex flex-col gap-3 pt-1 border-t border-white/5 animate-fade-in text-xs">
                            {/* Ingredients list */}
                            {recipe.ingredientes && recipe.ingredientes.length > 0 && (
                              <div className="bg-[#19120f]/80 p-3 rounded-lg border border-white/5">
                                <h5 className="font-bold text-[#b08968] mb-1.5 flex items-center gap-1.5">
                                  Ingredientes:
                                </h5>
                                <ul className="space-y-1 text-[#dac1b8]">
                                  {recipe.ingredientes.map((ing, ingIdx) => (
                                    <li key={ingIdx} className="flex justify-between items-center gap-2">
                                      <span className="font-medium text-white/90">{ing.nombre}</span>
                                      <span className="text-white/60 text-[11px] shrink-0 font-mono">
                                        {ing.cantidad} {ing.unidad}
                                      </span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {/* Steps list */}
                            {recipe.pasos && recipe.pasos.length > 0 && (
                              <div className="bg-[#19120f]/80 p-3 rounded-lg border border-white/5">
                                <h5 className="font-bold text-[#b08968] mb-2 flex items-center gap-1.5">
                                  Pasos de preparación:
                                </h5>
                                <ol className="space-y-2 text-[#dac1b8]">
                                  {recipe.pasos.map((paso, pasoIdx) => (
                                    <li key={pasoIdx} className="flex items-start gap-2 leading-relaxed">
                                      <span className="w-4 h-4 bg-[#A0522D] text-white text-[10px] font-black rounded-full flex items-center justify-center shrink-0 mt-0.5">
                                        {pasoIdx + 1}
                                      </span>
                                      <span className="flex-1">{paso.replace(/^Paso\s*\d+:\s*/i, '')}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}
                          </div>
                        )}

                        <button 
                          onClick={() => handleUseRecipe(recipe)}
                          disabled={usingRecipe}
                          className="w-full py-2.5 bg-[#A0522D] hover:bg-[#944925] disabled:opacity-50 disabled:cursor-wait active:scale-[0.98] text-white text-xs font-bold rounded-lg transition-all shadow-[0_4px_14px_0_rgba(160,82,45,0.39)] disabled:shadow-none mt-1"
                        >
                          {usingRecipe ? 'Cargando ingredientes...' : 'Usar esta receta →'}
                        </button>
                      </div>
                    );
                    })}
                  </div>
                )}
              </div>
            </div>
            );
          })}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#19120f]/60 border-l-2 border-[#A0522D] rounded-[16px] rounded-tl-sm p-4 flex gap-1.5 items-center">
                <span className="w-2 h-2 bg-[#dac1b8] rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-[#dac1b8] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-[#dac1b8] rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Upgrade Prompt */}
        {usage.current >= usage.max && (
          <div className="px-6 py-2 text-center text-xs text-red-300 bg-red-900/20 font-bold border-y border-red-500/20">
            Límite de {usage.max} consultas alcanzado hoy. <a href="#" className="underline">Obtén Premium</a>
          </div>
        )}

        {/* Input Area */}
        <div className="p-6 border-t border-white/10 bg-[#140d0a]/80 backdrop-blur-md relative">
          
          {/* Auth Guard Overlay */}
          {!session && (
            <div className="absolute inset-0 bg-[#140d0a]/90 backdrop-blur-md z-10 flex flex-col items-center justify-center p-6 text-center">
              <p className="text-white font-bold mb-3">Solo para usuarios registrados</p>
              <div className="flex gap-3">
                <a href="/auth/login" className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors">Iniciar Sesión</a>
              </div>
            </div>
          )}

          <div className="relative flex items-center">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!session || loading || usage.current >= usage.max}
              placeholder="Pregúntame qué cocinar..."
              className="w-full bg-[#261e1a] border border-[#54433c] focus:border-[#A0522D] text-white rounded-2xl pl-5 pr-14 py-4 outline-none transition-all placeholder-[#a28c84] shadow-inner disabled:opacity-50"
            />
            <button 
              onClick={handleSend}
              disabled={!session || loading || usage.current >= usage.max || !message.trim()}
              title="Enviar mensaje"
              aria-label="Enviar mensaje al Chef IA"
              className="absolute right-2 w-10 h-10 bg-[#A0522D] hover:bg-[#944925] disabled:bg-[#54433c] disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-[0_0_15px_rgba(160,82,45,0.4)] disabled:shadow-none"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}