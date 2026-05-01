import { supabase } from '@/lib/supabaseClient';
import { createClient } from '@supabase/supabase-js';

export const prerender = false;

export const GET = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('X-Supabase-Auth');
    if (!authHeader) return new Response(JSON.stringify({ usage: 0, max: 10 }), { status: 200 });

    const token = authHeader.replace('Bearer ', '');
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: `Bearer ${token}` } }
    });

    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    if (authError || !user) return new Response(JSON.stringify({ usage: 0, max: 10 }), { status: 200 });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: usageLogs, error: usageError } = await supabaseServer
      .from('ai_usage_log')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    return new Response(JSON.stringify({ 
      usage: usageLogs?.length || 0,
      max: 10
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    return new Response(JSON.stringify({ usage: 0, max: 10 }), { status: 200 });
  }
};

export const POST = async ({ request }) => {
  try {
    const authHeader = request.headers.get('Authorization') || request.headers.get('X-Supabase-Auth');
    if (!authHeader) {
      const allHeaders = Object.fromEntries(request.headers.entries());
      console.log("Headers recibidos:", allHeaders);
      return new Response(JSON.stringify({ error: 'No authorization header', received: allHeaders }), { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create an authenticated Supabase client for this request
    const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL || process.env.PUBLIC_SUPABASE_URL;
    const supabaseKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || process.env.PUBLIC_SUPABASE_ANON_KEY;
    const supabaseServer = createClient(supabaseUrl, supabaseKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    });

    // Verify token
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    // Check rate limit in ai_usage_log
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: usageLogs, error: usageError } = await supabaseServer
      .from('ai_usage_log')
      .select('id')
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (usageError) {
      console.error(usageError);
      return new Response(JSON.stringify({ error: 'Error checking usage limits' }), { status: 500 });
    }

    const MAX_REQUESTS = 10;
    const currentUsage = usageLogs?.length || 0;

    if (currentUsage >= MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: 'Has excedido el límite de 10 consultas diarias.' }), { status: 429 });
    }

    const { history = [], message } = await request.json();

    if (!message) {
      return new Response(JSON.stringify({ error: 'Message is required' }), { status: 400 });
    }

    // Extract keywords
    const keywords = message.split(' ').filter(w => w.length > 3);
    
    let contextIngredients = [];
    if (keywords.length > 0) {
      const orQuery = keywords.map(k => `nombre.ilike.%${k}%`).join(',');
      const { data: ingredients } = await supabaseServer
        .from('core_ingrediente')
        .select('nombre, id')
        .or(orQuery)
        .limit(40);
      
      contextIngredients = ingredients || [];
    }

    const systemPrompt = `Eres el "Chef IA" de ChileBite, un experto culinario y nutricionista.
Debes responder SIEMPRE en formato JSON válido.
Si el usuario pregunta algo general, responde:
{"tipo":"texto", "mensaje":"tu respuesta aquí en markdown"}

Si el usuario pide qué cocinar, sugiere 1 a 3 recetas en este formato:
{"tipo":"opciones", "opciones": [{"nombre":"...","descripcion":"...", "ingredientes":[{"nombre":"nombre exacto del ingrediente en db","gramos":150}, {"nombre":"otro ingrediente","gramos":25}], "pasos":["1...", "2..."]}]}

REGLA ESTRICTA DE PORCIONES: 
¡PROHIBIDO usar siempre 100 gramos! Debes asignar pesos lógicos y reales para 1 sola persona según el ingrediente. Ejemplo: Proteínas (150g-200g), Carbohidratos secos (60g-80g), Aceites/Salsas (10g-20g), Verduras (100g-250g). Varía los números.

Ingredientes disponibles en tu base de datos: ${JSON.stringify(contextIngredients.map(i => i.nombre))}.
DEBES priorizar usar exactamente estos nombres si coinciden.`;

    const geminiKey = import.meta.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY;

    if (!geminiKey) {
       return new Response(JSON.stringify({ error: 'Gemini API Key missing en el servidor' }), { status: 500 });
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [
            ...history.map(m => ({
              role: m.role === 'user' ? 'user' : 'model',
              parts: [{ text: m.content }]
            })),
            { role: 'user', parts: [{ text: message }] }
        ],
        generationConfig: { response_mime_type: "application/json" }
      })
    });

    const geminiData = await res.json();
    
    if (geminiData.error) {
      return new Response(JSON.stringify({ error: geminiData.error.message }), { status: 500 });
    }

    const textResponse = geminiData.candidates[0].content.parts[0].text;
    const parsedResponse = JSON.parse(textResponse);

    // Log the usage
    await supabaseServer.from('ai_usage_log').insert({
      user_id: user.id,
      tokens_used: geminiData.usageMetadata?.totalTokenCount || 0
    });

    return new Response(JSON.stringify({
      response: parsedResponse,
      usage: currentUsage + 1,
      max: MAX_REQUESTS
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
};
