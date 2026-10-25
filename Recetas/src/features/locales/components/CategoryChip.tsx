import React from 'react';

interface CategoryChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ 
  label, 
  isActive = false, 
  onClick
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative inline-flex items-center justify-center rounded-full px-5 py-2.5 text-xs md:text-sm font-medium tracking-normal transition-all duration-200 cursor-pointer select-none whitespace-nowrap active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 ${
        isActive
          ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-600/30 ring-1 ring-emerald-500'
          : 'mp-chip-inactive'
      }`}
    >
      <span>{label}</span>
    </button>
  );
};
