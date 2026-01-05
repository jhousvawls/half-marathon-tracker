import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getReadinessAdjustment(color: 'Green' | 'Yellow' | 'Red' | null, originalTarget: string): string {
    if (!color || color === 'Green') return originalTarget;
    if (color === 'Yellow') return `REDUCED: ${originalTarget} (Run slower/shorter)`;
    if (color === 'Red') return "REST or Light Walk Only";
    return originalTarget;
}
