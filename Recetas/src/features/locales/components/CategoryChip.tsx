import React from 'react';
import { Chip } from '@heroui/react';

interface CategoryChipProps {
  label: string;
  isActive?: boolean;
  onClick?: () => void;
}

export const CategoryChip: React.FC<CategoryChipProps> = ({ label, isActive, onClick }) => {
  return (
    <Chip
      as="button"
      onClick={onClick}
      variant={isActive ? 'primary' : 'secondary'}
      color={isActive ? 'accent' : 'default'}
      className={`cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 ${
        isActive 
          ? 'bg-copper-500 text-white shadow-lg shadow-copper-500/20' 
          : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <Chip.Label className="px-2 py-1 text-sm font-medium">
        {label}
      </Chip.Label>
    </Chip>
  );
};
