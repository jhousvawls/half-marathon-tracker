'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Calendar, Home, LineChart, List, Utensils } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const links = [
        { href: '/', label: 'Today', icon: Home },
        { href: '/plan', label: 'Plan', icon: Calendar },
        { href: '/check-in', label: 'Check-In', icon: List },
        { href: '/progress', label: 'Stats', icon: LineChart },
        { href: '/eat', label: 'Eat', icon: Utensils },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe">
            <div className="max-w-md mx-auto flex justify-around items-center h-16">
                {links.map(({ href, label, icon: Icon }) => {
                    const isActive = pathname === href;
                    return (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex flex-col items-center justify-center w-full h-full text-xs space-y-1",
                                isActive ? "text-blue-600 font-bold" : "text-gray-500 hover:text-gray-900"
                            )}
                        >
                            <Icon size={20} />
                            <span>{label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
