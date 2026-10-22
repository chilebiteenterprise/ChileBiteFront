import React from 'react';
import { Chip } from '@heroui/react';
import { Star, ShieldCheck } from 'lucide-react';

interface LocaleBadgeProps {
  type: 'featured' | 'certified' | 'pro';
}

export const LocaleBadge: React.FC<LocaleBadgeProps> = ({ type }) => {
  if (type === 'pro') {
    return (
      <Chip color="success" variant="soft" className="bg-emerald-100/90 dark:bg-emerald-950/80 backdrop-blur-md border border-emerald-300 dark:border-emerald-700">
        <span className="size-2 rounded-full bg-emerald-500 animate-pulse mr-1" />
        <Chip.Label className="text-[10px] font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
          Comercio Pro
        </Chip.Label>
      </Chip>
    );
  }

  if (type === 'featured') {
    return (
      <Chip color="warning" variant="soft" className="bg-amber-100/80 backdrop-blur-md border-amber-200">
        <Star className="size-3 text-amber-600 fill-amber-600" />
        <Chip.Label className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
          Destacado
        </Chip.Label>
      </Chip>
    );
  }

  return (
    <Chip color="accent" variant="soft" className="bg-copper-100/80 backdrop-blur-md border-copper-200">
      <ShieldCheck className="size-3 text-copper-600" />
      <Chip.Label className="text-[10px] font-bold uppercase tracking-wider text-copper-800">
        Certificado ChileBite
      </Chip.Label>
    </Chip>
  );
};
