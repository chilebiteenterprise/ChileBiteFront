import React from 'react';
import { Chip } from '@heroui/react';
import { Star, ShieldCheck } from 'lucide-react';

interface LocaleBadgeProps {
  type: 'featured' | 'certified';
}

export const LocaleBadge: React.FC<LocaleBadgeProps> = ({ type }) => {
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
