import type { Metadata, Viewport } from "next";
import "./globals.css";
import { BottomNav } from "@/app/components/BottomNav";

export const metadata: Metadata = {
    title: "Lean HM Tracker",
    description: "Half Marathon training tracker",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased pb-20 bg-gray-50 text-gray-900">
                <main className="min-h-screen max-w-md mx-auto bg-white shadow-xl min-h-[100dvh] relative pb-20">
                    {children}
                </main>
            </body>
        </html>
    );
}
