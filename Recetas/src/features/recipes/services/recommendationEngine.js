/**
 * recommendationEngine.js
 * 
 * Motor de recomendación escalable para ChileBite ("Para Ti").
 * 
 * Principios de Diseño:
 * 1. Complejidad O(N log N) con perfiles en O(K) donde K <= 50 interacciones.
 * 2. Manejo elegante de Cold Start (usuarios sin historial o anónimos).
 * 3. Ponderación multi-señal (Likes, Colecciones/Favoritos, Vistas locales).
 * 4. Normalización estricta [0, 1] en cada factor para evitar sesgos numéricos.
 * 5. Preparado para migración a SQL/pgvector si el catálogo crece a >50k registros.
 */

// Pesos del perfil de afinidad
const WEIGHTS = {
    AFFINITY_CATEGORY: 0.40,   // Tipo de plato (postre, fondo, entrada, etc.)
    AFFINITY_LIFESTYLE: 0.30,  // Estilos de vida (vegano, keto, sin gluten)
    AFFINITY_DIFFICULTY: 0.15, // Dificultad adecuada a la habilidad usual
    AFFINITY_COUNTRY: 0.15     // Preferencia gastronómica geográfica
};

// Conversión estándar de dificultad textual a escala numérica [1..5]
export const dificultadToNumero = (dificultad) => {
    switch (dificultad) {
        case "Muy Fácil": return 1;
        case "Fácil": return 2;
        case "Media": return 3;
        case "Difícil": return 4;
        case "Muy Difícil": return 5;
        default: return 3;
    }
};

/**
 * Obtiene el historial de visualizaciones locales para usuarios anónimos o no logueados.
 * Capacidad máxima de 30 IDs para mantener O(1) de consumo de memoria y almacenamiento.
 */
export const getLocalViewHistory = () => {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem('cb_viewed_recipes');
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
};

/**
 * Registra una vista de receta en localStorage de manera atómica y no intrusiva.
 */
export const trackRecipeView = (recipeId) => {
    if (typeof window === 'undefined' || !recipeId) return;
    try {
        const views = getLocalViewHistory().filter(id => String(id) !== String(recipeId));
        views.unshift(String(recipeId));
        // Mantiene solo las últimas 30
        localStorage.setItem('cb_viewed_recipes', JSON.stringify(views.slice(0, 30)));
    } catch (e) {
        // Safe fail
    }
};

/**
 * Obtiene el mapa de tiempos de lectura/permanencia (Dwell Time) acumulados en segundos.
 */
export const getLocalDwellTimes = () => {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem('cb_recipe_dwell_times');
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
};

/**
 * Registra o acumula el tiempo de lectura (Dwell Time) en una receta.
 * Si el usuario pasa más de 20-30s, es una señal de interés profundo.
 */
export const trackRecipeDwellTime = (recipeId, seconds) => {
    if (typeof window === 'undefined' || !recipeId || !seconds || seconds < 3) return;
    try {
        const dwellMap = getLocalDwellTimes();
        const currentSecs = dwellMap[String(recipeId)] || 0;
        // Acumular hasta un tope razonable de 300s (5 min) por receta para evitar sesgos
        dwellMap[String(recipeId)] = Math.min(300, currentSecs + Math.round(seconds));
        
        // Conservar como máximo las últimas 40 recetas para consumo O(1)
        const entries = Object.entries(dwellMap);
        if (entries.length > 40) {
            const trimmed = Object.fromEntries(entries.slice(entries.length - 40));
            localStorage.setItem('cb_recipe_dwell_times', JSON.stringify(trimmed));
        } else {
            localStorage.setItem('cb_recipe_dwell_times', JSON.stringify(dwellMap));
        }
    } catch (e) {
        // Safe fail
    }
};

/**
 * Construye el vector de preferencias del usuario a partir de sus interacciones observadas.
 * 
 * @param {Object} params
 * @param {Set|Array} params.likedRecipeIds - IDs de recetas a las que dio like
 * @param {Set|Array} params.savedRecipeIds - IDs de recetas guardadas en colecciones
 * @param {Array} params.viewedRecipeIds - IDs de recetas vistas recientemente
 * @param {Object} params.dwellTimes - Mapa { [recipeId]: seconds } de tiempo de lectura
 * @param {Array} params.recipesCatalog - Catálogo completo de recetas disponibles
 * @returns {Object} Perfil de preferencias normalizado
 */
export const buildUserProfile = ({
    likedRecipeIds = new Set(),
    savedRecipeIds = new Set(),
    viewedRecipeIds = [],
    dwellTimes = {},
    recipesCatalog = []
}) => {
    const likedSet = likedRecipeIds instanceof Set ? likedRecipeIds : new Set(likedRecipeIds);
    const savedSet = savedRecipeIds instanceof Set ? savedRecipeIds : new Set(savedRecipeIds);
    const viewedSet = new Set(viewedRecipeIds.map(String));

    // Mapa rápido de recetas por ID para evitar búsquedas O(N)
    const recipeMap = new Map();
    for (const r of recipesCatalog) {
        recipeMap.set(String(r.id), r);
    }

    const categoryScores = {};
    const lifestyleScores = {};
    const countryScores = {};
    let totalDifficultySum = 0;
    let totalWeight = 0;

    // Evaluamos interacciones con sus respectivos factores de ponderación
    // Guardado (3.0): Señal explícita máxima de intención
    // Like (2.0): Señal explícita de aprobación
    // Dwell Time alto >= 25s (2.5): Señal implícita de lectura e interés profundo
    // Vista simple (1.0): Señal implícita de curiosidad
    const evaluatedInteractions = new Map();

    savedSet.forEach(id => {
        const key = String(id);
        evaluatedInteractions.set(key, Math.max(evaluatedInteractions.get(key) || 0, 3.0));
    });

    likedSet.forEach(id => {
        const key = String(id);
        evaluatedInteractions.set(key, Math.max(evaluatedInteractions.get(key) || 0, 2.0));
    });

    // Procesar Dwell Time (Tiempo de lectura)
    Object.entries(dwellTimes || {}).forEach(([id, secs]) => {
        const key = String(id);
        if (secs >= 25) {
            evaluatedInteractions.set(key, Math.max(evaluatedInteractions.get(key) || 0, 2.5));
        } else if (secs >= 10) {
            evaluatedInteractions.set(key, Math.max(evaluatedInteractions.get(key) || 0, 1.8));
        }
    });

    viewedSet.forEach(id => {
        const key = String(id);
        if (!evaluatedInteractions.has(key)) {
            evaluatedInteractions.set(key, 1.0);
        }
    });

    evaluatedInteractions.forEach((weight, id) => {
        const recipe = recipeMap.get(id);
        if (!recipe) return;

        totalWeight += weight;

        // Categoría (Tipo de Plato)
        const catName = recipe.tipo_plato_detalle?.nombre || recipe.core_tipoplato?.nombre;
        if (catName) {
            categoryScores[catName] = (categoryScores[catName] || 0) + weight;
        }

        // Estilos de Vida
        const estilos = recipe.estilos_vida_detalle || recipe.core_receta_estilos_vida || [];
        estilos.forEach(item => {
            const name = item.nombre || item.core_estilovida?.nombre;
            if (name) {
                lifestyleScores[name] = (lifestyleScores[name] || 0) + weight;
            }
        });

        // País
        const country = recipe.pais_nombre || recipe.core_pais?.nombre;
        if (country) {
            countryScores[country] = (countryScores[country] || 0) + weight;
        }

        // Dificultad
        const diffNum = dificultadToNumero(recipe.dificultad);
        totalDifficultySum += diffNum * weight;
    });

    const hasHistory = totalWeight > 0;

    // Normalizar a distribuciones de probabilidad [0..1]
    const normalizeMap = (map) => {
        if (!hasHistory) return {};
        const normalized = {};
        for (const [key, val] of Object.entries(map)) {
            normalized[key] = val / totalWeight;
        }
        return normalized;
    };

    return {
        hasHistory,
        totalInteractions: evaluatedInteractions.size,
        preferredCategories: normalizeMap(categoryScores),
        preferredLifestyles: normalizeMap(lifestyleScores),
        preferredCountries: normalizeMap(countryScores),
        averageDifficulty: hasHistory ? totalDifficultySum / totalWeight : 3.0,
        likedSet,
        savedSet,
        viewedSet
    };
};

/**
 * Calcula el puntaje de recomendación para una receta individual.
 * 
 * @param {Object} recipe - Receta a evaluar
 * @param {Object} profile - Perfil generado por buildUserProfile
 * @param {number} maxLikesInCatalog - Conteo máximo de likes para normalización logarítmica
 * @returns {number} Score en rango [0..100]
 */
export const scoreRecipe = (recipe, profile, maxLikesInCatalog = 50) => {
    // 1. Social Proof (Popularidad normalizada en escala logarítmica)
    // log(1 + likes) / log(1 + maxLikes) evita que recetas de 10,000 likes monopolicen el feed
    const likes = Number(recipe.contador_likes || recipe.likes || 0);
    const safeMax = Math.max(maxLikesInCatalog, 10);
    const popularityScore = Math.min(1.0, Math.log1p(likes) / Math.log1p(safeMax));

    // 2. Freshness Decay (Frescura)
    // Recetas de los últimos 30 días reciben un impulso decreciente
    let freshnessScore = 0.2; // base
    if (recipe.creado_en || recipe.fecha_creacion) {
        const createdDate = new Date(recipe.creado_en || recipe.fecha_creacion);
        const daysDiff = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysDiff >= 0 && daysDiff <= 30) {
            freshnessScore = 1.0 - (daysDiff / 30) * 0.8; // de 1.0 cae hasta 0.2
        }
    }

    // Si el usuario no tiene historial (Cold Start):
    // Combinamos popularidad (65%) y frescura (35%) para un feed vibrante y de alta calidad
    if (!profile || !profile.hasHistory) {
        const coldStartScore = (popularityScore * 0.65) + (freshnessScore * 0.35);
        return coldStartScore * 100;
    }

    // 3. Afinidad de Categoría (Tipo de Plato)
    const catName = recipe.tipo_plato_detalle?.nombre || recipe.core_tipoplato?.nombre;
    const catAffinity = (catName && profile.preferredCategories[catName]) || 0;

    // 4. Afinidad de Estilos de Vida
    const estilos = recipe.estilos_vida_detalle || recipe.core_receta_estilos_vida || [];
    let lifestyleAffinity = 0;
    if (estilos.length > 0) {
        let matched = 0;
        estilos.forEach(item => {
            const name = item.nombre || item.core_estilovida?.nombre;
            if (name && profile.preferredLifestyles[name]) {
                matched += profile.preferredLifestyles[name];
            }
        });
        lifestyleAffinity = Math.min(1.0, matched);
    }

    // 5. Afinidad de Dificultad
    const recipeDiff = dificultadToNumero(recipe.dificultad);
    const diffDistance = Math.abs(recipeDiff - profile.averageDifficulty);
    // diffDistance varía entre 0 (perfecto) y 4 (extremo opuesto)
    const difficultyAffinity = Math.max(0, 1.0 - (diffDistance / 4.0));

    // 6. Afinidad de País
    const country = recipe.pais_nombre || recipe.core_pais?.nombre;
    const countryAffinity = (country && profile.preferredCountries[country]) || 0;

    // Afinidad Compuesta [0..1]
    const compositeAffinity = (
        (catAffinity * WEIGHTS.AFFINITY_CATEGORY) +
        (lifestyleAffinity * WEIGHTS.AFFINITY_LIFESTYLE) +
        (difficultyAffinity * WEIGHTS.AFFINITY_DIFFICULTY) +
        (countryAffinity * WEIGHTS.AFFINITY_COUNTRY)
    );

    // Ajuste de novedad / descubrimiento (Discovery Penalty / Exploration Bonus)
    // Si el usuario ya guardó o likeó la receta, sigue siendo muy relevante pero le damos
    // un pequeño espacio para que descubra recetas afines aún no vistas.
    const isAlreadySaved = profile.savedSet.has(recipe.id) || profile.savedSet.has(String(recipe.id));
    const isAlreadyLiked = profile.likedSet.has(recipe.id) || profile.likedSet.has(String(recipe.id));
    const discoveryMultiplier = (isAlreadySaved || isAlreadyLiked) ? 0.90 : 1.0;

    // Ponderación Final para usuarios con historial:
    // 60% Afinidad de gustos del usuario
    // 25% Popularidad / Calidad social
    // 15% Novedad y frescura
    const totalScore = (
        (compositeAffinity * 0.60) +
        (popularityScore * 0.25) +
        (freshnessScore * 0.15)
    ) * discoveryMultiplier;

    return totalScore * 100;
};

/**
 * Aplica reordenamiento por diversidad (Anti-Burbuja de Filtro).
 * Reglas de Diversidad:
 * 1. Restringe a un máximo de 2 recetas consecutivas de la misma categoría (tipo_plato).
 * 2. Cada 4-5 items afines, promueve una receta de exploración (alta popularidad pero de una categoría distinta).
 * 
 * @param {Array<{recipe: Object, score: number}>} scoredList - Lista ordenada por puntuación
 * @param {Object} userProfile - Perfil del usuario
 * @returns {Array<Object>} Lista de recetas con diversidad gastronómica optimizada
 */
export const applyDiversityReranking = (scoredList, userProfile) => {
    if (!scoredList || scoredList.length <= 3 || !userProfile?.hasHistory) {
        return scoredList.map(item => item.recipe);
    }

    const pool = [...scoredList];
    const result = [];
    const maxLookahead = 8; // Ventana acotada para garantizar complejidad O(N)

    const getCat = (r) => r.tipo_plato_detalle?.nombre || r.core_tipoplato?.nombre || 'General';

    while (pool.length > 0) {
        const last1 = result[result.length - 1];
        const last2 = result[result.length - 2];
        const lastCat1 = last1 ? getCat(last1) : null;
        const lastCat2 = last2 ? getCat(last2) : null;
        const isCluster = Boolean(lastCat1 && lastCat1 === lastCat2);

        let selectedIndex = 0;

        // Anti-clustering: si las 2 anteriores tienen la misma categoría, buscar alternativa cercana
        if (isCluster) {
            const altIndex = pool.findIndex((item, idx) => idx < maxLookahead && getCat(item.recipe) !== lastCat1);
            if (altIndex !== -1) {
                selectedIndex = altIndex;
            }
        }

        // Inyección de Descubrimiento/Exploración cada 5 items (rompe monotonía de gustos dominantes)
        if (result.length > 0 && result.length % 5 === 0 && selectedIndex === 0) {
            const topCategories = Object.keys(userProfile.preferredCategories || {});
            const dominantCat = topCategories[0];
            if (dominantCat && getCat(pool[0].recipe) === dominantCat) {
                const exploreIndex = pool.findIndex((item, idx) => idx < maxLookahead && getCat(item.recipe) !== dominantCat);
                if (exploreIndex !== -1) {
                    selectedIndex = exploreIndex;
                }
            }
        }

        const [picked] = pool.splice(selectedIndex, 1);
        result.push(picked.recipe);
    }

    return result;
};

/**
 * Ordena y clasifica el conjunto de recetas según el algoritmo "Para Ti",
 * incorporando Diversity Reranking para evitar burbujas de filtro.
 * 
 * @param {Array} recipes - Lista de recetas a clasificar
 * @param {Object} userProfile - Perfil de usuario generado
 * @returns {Array} Nueva lista ordenada de mayor a menor relevancia
 */
export const rankRecipesForYou = (recipes, userProfile) => {
    if (!Array.isArray(recipes) || recipes.length === 0) return [];

    // Encontrar el máximo de likes en este lote para normalización precisa
    let maxLikes = 0;
    for (const r of recipes) {
        const l = Number(r.contador_likes || r.likes || 0);
        if (l > maxLikes) maxLikes = l;
    }

    // Calcular puntaje para cada receta de manera inmutable
    const scored = recipes.map(recipe => ({
        recipe,
        score: scoreRecipe(recipe, userProfile, maxLikes)
    }));

    // Ordenamiento descendente por score
    scored.sort((a, b) => b.score - a.score);

    // Aplicar inyección de diversidad y anti-clustering
    return applyDiversityReranking(scored, userProfile);
};
