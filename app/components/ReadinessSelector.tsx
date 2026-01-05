'use client';

import { ReadinessColor } from "@/lib/types";
import { cn } from "@/lib/utils";

interface ReadinessSelectorProps {
    value: ReadinessColor | null;
    onChange: (val: ReadinessColor) => void;
}

export function ReadinessSelector({ value, onChange }: ReadinessSelectorProps) {
    return (
        <div className="flex gap-2 mt-2">
            {(['Green', 'Yellow', 'Red'] as const).map((color) => (
                <button
                    key={color}
                    onClick={() => onChange(color)}
                    className={cn(
                        "flex-1 py-2 rounded-lg border font-medium transition-all",
                        color === 'Green' && "border-green-500 text-green-700 hover:bg-green-50",
                        color === 'Yellow' && "border-yellow-500 text-yellow-700 hover:bg-yellow-50",
                        color === 'Red' && "border-red-500 text-red-700 hover:bg-red-50",
                        value === color && color === 'Green' && "bg-green-100 ring-2 ring-green-500",
                        value === color && color === 'Yellow' && "bg-yellow-100 ring-2 ring-yellow-500",
                        value === color && color === 'Red' && "bg-red-100 ring-2 ring-red-500"
                    )}
                >
                    {color}
                </button>
            ))}
        </div>
    );
}
