export interface ChileRegion {
  value: string;
  name: string;
  shortName: string;
  romanNumeral: string;
  zone: 'Norte' | 'Centro' | 'Sur' | 'Austral' | 'Metropolitana';
}

export const CHILE_REGIONS: ChileRegion[] = [
  { value: "Arica y Parinacota", name: "Región de Arica y Parinacota", shortName: "Arica y Parinacota", romanNumeral: "XV", zone: "Norte" },
  { value: "Tarapacá", name: "Región de Tarapacá", shortName: "Tarapacá", romanNumeral: "I", zone: "Norte" },
  { value: "Antofagasta", name: "Región de Antofagasta", shortName: "Antofagasta", romanNumeral: "II", zone: "Norte" },
  { value: "Atacama", name: "Región de Atacama", shortName: "Atacama", romanNumeral: "III", zone: "Norte" },
  { value: "Coquimbo", name: "Región de Coquimbo", shortName: "Coquimbo", romanNumeral: "IV", zone: "Norte" },
  { value: "Valparaíso", name: "Región de Valparaíso", shortName: "Valparaíso", romanNumeral: "V", zone: "Centro" },
  { value: "Metropolitana de Santiago", name: "Región Metropolitana de Santiago", shortName: "Metropolitana", romanNumeral: "RM", zone: "Metropolitana" },
  { value: "O'Higgins", name: "Región del Libertador Bernardo O'Higgins", shortName: "O'Higgins", romanNumeral: "VI", zone: "Centro" },
  { value: "Maule", name: "Región del Maule", shortName: "Maule", romanNumeral: "VII", zone: "Centro" },
  { value: "Ñuble", name: "Región de Ñuble", shortName: "Ñuble", romanNumeral: "XVI", zone: "Centro" },
  { value: "Biobío", name: "Región del Biobío", shortName: "Biobío", romanNumeral: "VIII", zone: "Sur" },
  { value: "La Araucanía", name: "Región de La Araucanía", shortName: "La Araucanía", romanNumeral: "IX", zone: "Sur" },
  { value: "Los Ríos", name: "Región de Los Ríos", shortName: "Los Ríos", romanNumeral: "XIV", zone: "Sur" },
  { value: "Los Lagos", name: "Región de Los Lagos", shortName: "Los Lagos", romanNumeral: "X", zone: "Sur" },
  { value: "Aysén", name: "Región de Aysén del Gral. Carlos Ibáñez", shortName: "Aysén", romanNumeral: "XI", zone: "Austral" },
  { value: "Magallanes", name: "Región de Magallanes y Antártica", shortName: "Magallanes", romanNumeral: "XII", zone: "Austral" },
];
