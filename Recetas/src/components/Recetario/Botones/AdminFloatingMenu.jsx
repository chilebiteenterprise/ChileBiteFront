import React from 'react';
import { Tooltip } from "@heroui/react";

export default function AdminFloatingMenu() {
    // Array dinámico de opciones basado en la lógica. Fácilmente expandible a "mas o menos de 5".
    const adminActions = [
        {
            id: 'new_recipe',
            label: "Crear Nueva Receta",
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
            ),
            action: () => window.location.href = '/admin/receta-form',
            color: "text-white", 
            bg: "bg-[#A0522D]",
            bgHover: "hover:bg-[#8B4513]"
        }
        // Future actions (e.g. Dashboard) can simply be added as objects here.
    ];

    return (
        <div className="sticky bottom-6 z-50 flex justify-center w-full pointer-events-none px-4">
            <div className="pointer-events-auto bg-white dark:bg-[#1a1d24] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-gray-200 dark:border-gray-800 rounded-[2rem] px-5 py-3 flex items-center gap-3 transition-colors">
                
                {/* Admin Badge Prefix */}
                <div className="pr-4 mr-1 border-r border-gray-200 dark:border-gray-800 flex items-center select-none">
                    <span className="text-xs font-black tracking-widest text-[#A0522D] dark:text-[#E89E75] uppercase flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        Admin
                    </span>
                </div>

                {/* Dinamic Icons */}
                {adminActions.map((item) => (
                    <Tooltip key={item.id} content={item.label} placement="top" className="font-semibold text-xs rounded-xl shadow-lg border border-gray-100 dark:border-gray-800 mt-1">
                        <button
                            onClick={item.action}
                            className={`w-11 h-11 flex items-center justify-center rounded-full transition-all duration-300 ${item.color} ${item.bg} ${item.bgHover} shadow-md hover:scale-105 hover:-translate-y-1 active:scale-95`}
                            aria-label={item.label}
                        >
                            {item.icon}
                        </button>
                    </Tooltip>
                ))}
            </div>
        </div>
    );
}
