import type { Config } from "tailwindcss";

export default {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                'b-sand': '#F5F2EB',
                'b-charcoal': '#2D2D2D',
                'b-sage': '#8DA399',
                'b-clay': '#D4A59A',
                'b-mist': '#E0E6E6',
                'b-night': '#1A1A1A',
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                serif: ['Lora', 'serif'],
            },
        },
    },
    plugins: [],
} satisfies Config;
