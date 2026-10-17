/**
 * Reglas de unidades y medición culinaria para ChileBite
 * Gestiona unidades permitidas según naturaleza del alimento y formateo inteligente de porciones.
 */

export const ALL_UNIT_OPTIONS = [
  { val: 'g', label: 'Gramos (g)' },
  { val: 'kg', label: 'Kilos (kg)' },
  { val: 'ml', label: 'Mililitros (ml)' },
  { val: 'l', label: 'Litros (l)' },
  { val: 'unidad', label: 'Unidades (ud)' },
  { val: 'cda', label: 'Cucharadas (cda)' },
  { val: 'taza', label: 'Tazas' }
];

/**
 * Determina las unidades lógicas y aplicables para un ingrediente específico.
 * Evita absurdos como "1 cucharada de manzana" o "1 unidad de aceite".
 */
export const getAvailableUnitsForIngredient = (ing) => {
  if (!ing) return ALL_UNIT_OPTIONS;

  const nom = (ing.nombre || '').toLowerCase().trim();
  const cat = (ing.categoria || '').trim();
  const tipoMedida = ing.tipo_medida || '';
  const hasUnitWeight = ing.peso_por_unidad_gramos && Number(ing.peso_por_unidad_gramos) > 0;
  const hasCupWeight = ing.peso_por_taza_gramos && Number(ing.peso_por_taza_gramos) > 0;
  const hasSpoonWeight = ing.peso_por_cucharada_gramos && Number(ing.peso_por_cucharada_gramos) > 0;

  // 1. Líquidos y bebibles
  const isLiquid = tipoMedida === 'volumen' || 
    cat === 'Bebidas' || 
    cat === 'Grasas y Aceites' ||
    /aceite|leche|vinagre|jugo|agua|vino|caldo|salsa|infusión|infusion|licor|almíbar|almibar|néctar|nectar|yogurt|yogur|sopa/i.test(nom);

  if (isLiquid) {
    return ALL_UNIT_OPTIONS.filter(u => ['ml', 'l', 'cda', 'taza'].includes(u.val));
  }

  // 2. Condimentos, especias y sales
  const isSpice = cat === 'Especias y Hierbas' || 
    /sal |sal$|sal marina|pimienta|orégano|oregano|comino|canela en polvo|curry|pimentón dulce|merquén|merquen|nuez moscada|laurel molido/i.test(nom);

  if (isSpice) {
    return ALL_UNIT_OPTIONS.filter(u => ['cda', 'g'].includes(u.val));
  }

  // 3. Carnes, aves y pescados
  const isMeatOrFish = cat === 'Carnes y Aves' || cat === 'Pescados y Mariscos' ||
    /carne|pollo|vacuno|cerdo|pavo|salmón|salmon|merluza|reineta|atún|atun|posta|lomo|asado|pechuga/i.test(nom);

  if (isMeatOrFish) {
    // Si es una pieza indivisible tipo hamburguesa o vienesa
    const isPiece = hasUnitWeight || /hamburguesa|croqueta|salchicha|vienesa|trutro|tuto|ala de pollo|filete/i.test(nom);
    return ALL_UNIT_OPTIONS.filter(u => isPiece ? ['g', 'kg', 'unidad'].includes(u.val) : ['g', 'kg'].includes(u.val));
  }

  // 4. Frutas y vegetales enteros o en piezas
  const isProduce = cat === 'Frutas' || cat === 'Vegetales' ||
    /manzana|palta|huevo|plátano|platano|naranja|pera|durazno|limón|limon|cebolla|tomate|papa |papa$|zapallo|zanahoria|pimentón|pimenton|ajo|pepino|lechuga|choclo|aceituna/i.test(nom);

  if (isProduce) {
    // Ingredientes pequeños donde la taza tiene sentido (berries, choclo desgranado, aceitunas, arvejas)
    const allowsCup = hasCupWeight || /aceituna|arándano|arandano|frutilla|frambuesa|mora|choclo desgranado|arveja|champiñ|uva/i.test(nom);
    // Ingredientes en pasta donde cucharada tiene sentido
    const allowsSpoon = hasSpoonWeight || /pasta de ajo|concentrado/i.test(nom);

    return ALL_UNIT_OPTIONS.filter(u => {
      if (u.val === 'unidad' || u.val === 'g' || u.val === 'kg') return true;
      if (u.val === 'taza') return allowsCup;
      if (u.val === 'cda') return allowsSpoon;
      return false;
    });
  }

  // 5. Cereales, harinas, granos, azúcares, legumbres
  const isGrainsOrSugars = cat === 'Cereales y Granos' || cat === 'Legumbres' || cat === 'Dulces y Azúcares' ||
    /harina|arroz|avena|azúcar|azucar|miel|poroto|lenteja|garbanzo|chía|chia|linaza|cacao/i.test(nom);

  if (isGrainsOrSugars) {
    const allowsPiece = hasUnitWeight || /pan|marraqueta|hallulla|galleta|barra/i.test(nom);
    return ALL_UNIT_OPTIONS.filter(u => {
      if (['g', 'kg', 'taza', 'cda'].includes(u.val)) return true;
      if (u.val === 'unidad') return allowsPiece;
      return false;
    });
  }

  // 6. Fallback inteligente
  return ALL_UNIT_OPTIONS.filter(u => {
    if (tipoMedida === 'volumen') return ['ml', 'l', 'cda', 'taza'].includes(u.val);
    if (tipoMedida === 'unidad') return ['unidad', 'g', 'kg'].includes(u.val);
    return ['g', 'kg', 'taza', 'cda'].includes(u.val);
  });
};

/**
 * Formatea cantidades escaladas de ingredientes de forma natural y humana.
 * Ejemplo: 1950g -> "1 kilo y 950 gramos de Zapallo"
 *          2000g -> "2 kilos de Papa"
 *          13 ud -> "13 unidades de Choclo"
 *          1500ml -> "1 litro y 500 ml de Leche"
 */
export const formatScaledIngredient = (rawCantidad, rawUnidad, nombre) => {
  const cant = parseFloat(rawCantidad) || 0;
  const unit = (rawUnidad || '').toLowerCase().trim();
  const cleanNombre = (nombre || '').replace(/^de\s+/i, '').trim();
  const nameSuffix = cleanNombre ? ` de ${cleanNombre}` : '';

  // Gramos (g)
  if (unit === 'g' || unit === 'gr' || unit === 'gramos' || unit === 'gramo') {
    if (cant >= 1000) {
      const kilos = Math.floor(cant / 1000);
      const gramos = Math.round(cant % 1000);
      if (gramos === 0) {
        return `${kilos} ${kilos === 1 ? 'kilo' : 'kilos'}${nameSuffix}`;
      }
      return `${kilos} ${kilos === 1 ? 'kilo' : 'kilos'} y ${gramos} ${gramos === 1 ? 'gramo' : 'gramos'}${nameSuffix}`;
    }
    const cleanCant = Number(cant.toFixed(1)).toString();
    return `${cleanCant} g${nameSuffix}`;
  }

  // Kilos (kg)
  if (unit === 'kg' || unit === 'kilo' || unit === 'kilos') {
    if (cant < 1) {
      const gramos = Math.round(cant * 1000);
      return `${gramos} g${nameSuffix}`;
    }
    const kilos = Math.floor(cant);
    const gramos = Math.round((cant - kilos) * 1000);
    if (gramos === 0) {
      return `${kilos} ${kilos === 1 ? 'kilo' : 'kilos'}${nameSuffix}`;
    }
    return `${kilos} ${kilos === 1 ? 'kilo' : 'kilos'} y ${gramos} ${gramos === 1 ? 'gramo' : 'gramos'}${nameSuffix}`;
  }

  // Mililitros (ml)
  if (unit === 'ml' || unit === 'cc' || unit === 'mililitros' || unit === 'mililitro') {
    if (cant >= 1000) {
      const litros = Math.floor(cant / 1000);
      const ml = Math.round(cant % 1000);
      if (ml === 0) {
        return `${litros} ${litros === 1 ? 'litro' : 'litros'}${nameSuffix}`;
      }
      return `${litros} ${litros === 1 ? 'litro' : 'litros'} y ${ml} ml${nameSuffix}`;
    }
    const cleanCant = Number(cant.toFixed(1)).toString();
    return `${cleanCant} ml${nameSuffix}`;
  }

  // Litros (l)
  if (unit === 'l' || unit === 'lt' || unit === 'litro' || unit === 'litros') {
    if (cant < 1) {
      const ml = Math.round(cant * 1000);
      return `${ml} ml${nameSuffix}`;
    }
    const litros = Math.floor(cant);
    const ml = Math.round((cant - litros) * 1000);
    if (ml === 0) {
      return `${litros} ${litros === 1 ? 'litro' : 'litros'}${nameSuffix}`;
    }
    return `${litros} ${litros === 1 ? 'litro' : 'litros'} y ${ml} ml${nameSuffix}`;
  }

  // Unidades / Piezas
  if (unit === 'unidad' || unit === 'ud' || unit === 'pieza' || unit === 'piezas' || unit === 'unidades') {
    const cleanCant = Number(cant.toFixed(1)).toString();
    const label = cant === 1 ? 'unidad' : 'unidades';
    return `${cleanCant} ${label}${nameSuffix}`;
  }

  // Tazas
  if (unit === 'taza' || unit === 'tazas') {
    const cleanCant = Number(cant.toFixed(1)).toString();
    const label = cant === 1 ? 'taza' : 'tazas';
    return `${cleanCant} ${label}${nameSuffix}`;
  }

  // Cucharadas
  if (unit === 'cda' || unit === 'cucharada' || unit === 'cucharadas') {
    const cleanCant = Number(cant.toFixed(1)).toString();
    const label = cant === 1 ? 'cucharada' : 'cucharadas';
    return `${cleanCant} ${label}${nameSuffix}`;
  }

  // Fallback
  const cleanCant = Number(cant.toFixed(1)).toString();
  return `${cleanCant} ${rawUnidad}${nameSuffix}`;
};

/**
 * Escala y formatea de forma inteligente una línea de texto plano de ingrediente.
 * Ejemplo: "150 g de Zapallo" con escala 13 -> "1 kilo y 950 gramos de Zapallo"
 */
export const formatScaledIngredientText = (line, scale = 1) => {
  if (!line) return '';
  if (scale === 1) return line;

  // Busca patrones como "150 g de ...", "2 tazas de ...", "1 unidad de ..."
  const match = line.match(/^([\d.,]+)\s*([a-zA-ZáéíóúÁÉÍÓÚñÑ]+)?\s*(de\s+)?(.*)$/i);
  if (!match) return line;

  const rawNum = parseFloat(match[1].replace(',', '.'));
  if (isNaN(rawNum)) return line;

  const scaledNum = rawNum * scale;
  const unit = match[2] || '';
  const rest = match[4] || '';

  if (unit) {
    return formatScaledIngredient(scaledNum, unit, rest);
  }

  const cleanCant = Number(scaledNum.toFixed(1)).toString();
  return `${cleanCant} ${rest}`;
};

