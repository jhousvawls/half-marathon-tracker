import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                primary: "#3b82f6", // Blue-500
                secondary: "#10b981", // Emerald-500
                accent: "#f59e0b", // Amber-500
            },
        },
    },
    plugins: [],
};
export default config;
