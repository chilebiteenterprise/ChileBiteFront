import React from 'react';
import { CategoryChip } from './CategoryChip';

const categories = [
  "Todos",
  "Restaurantes",
  "Picadas Tradicionales",
  "Cafeterías",
  "Viñedos",
  "Mercados"
];

export const LocalesFilter: React.FC = () => {
  const [active, setActive] = React.useState("Todos");

  return (
    <div className="sticky top-20 z-40 bg-zinc-50/80 py-6 backdrop-blur-xl dark:bg-zinc-950/80">
      <div className="mx-auto max-w-7xl px-6">
        <div className="no-scrollbar flex items-center gap-3 overflow-x-auto pb-2">
          {categories.map((category) => (
            <CategoryChip
              key={category}
              label={category}
              isActive={active === category}
              onClick={() => setActive(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
