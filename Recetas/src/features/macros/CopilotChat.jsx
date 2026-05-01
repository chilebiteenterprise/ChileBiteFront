import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Sparkles } from 'lucide-react';

export default function CopilotChat({ isOpen, onClose, onAdd, onClear }) {
  const { session } = useAuth();
  const [message, setMessage] = useState('');
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
      // 1. Limpiar calculadora actual
      if (onClear) onClear();

      // 2. Por cada ingrediente, buscar en la BD (core_ingrediente)
      for (const ing of recipe.ingredientes) {
        const { data, error } = await supabase
          .from('core_ingrediente')
          .select('*')
          .ilike('nombre', `%${ing.nombre}%`)
          .limit(1);

        if (data && data.length > 0) {
          const foundIng = data[0];
          foundIng.grams = ing.gramos || 100;
          // 3. Añadir a la calculadora con los gramos sugeridos
          if (onAdd) {
            onAdd(foundIng);
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
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button 
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors text-white"
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
                    
                    {msg.content.tipo === 'opciones' && msg.content.opciones?.map((recipe, idx) => (
                      <div key={idx} className="bg-[#261e1a] p-4 rounded-xl border border-white/5 hover:border-[#A0522D]/50 transition-colors group">
                        <h4 className="font-bold text-white mb-1">{recipe.nombre}</h4>
                        <p className="text-xs text-[#dac1b8] mb-3">{recipe.descripcion}</p>
                        <button 
                          onClick={() => handleUseRecipe(recipe)}
                          disabled={usingRecipe}
                          className="w-full py-2 bg-[#A0522D] hover:bg-[#944925] disabled:opacity-50 disabled:cursor-wait active:scale-[0.98] text-white text-xs font-bold rounded-lg transition-all shadow-[0_4px_14px_0_rgba(160,82,45,0.39)] disabled:shadow-none"
                        >
                          {usingRecipe ? 'Cargando ingredientes...' : 'Usar esta receta →'}
                        </button>
                      </div>
                    ))}
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
