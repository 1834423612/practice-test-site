module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            colors: {
                primary: '#0d9488',
                secondary: '#14b8a6',
                accent1: '#fcd34d',
                accent2: '#34d399',
            },
            // 强制自定义灰阶色板，覆盖 Tailwind v4 默认的 oklch 灰阶
            gray: {
                50: '#f9fafb',
                100: '#f3f4f6',
                200: '#e5e7eb',
                300: '#d1d5db',
                400: '#9ca3af',
                500: '#6b7280',
                600: '#4b5563',
                700: '#374151',
                800: '#1f2937',
                900: '#111827',
                950: '#030712',
            },
        },
    },
    plugins: [],
}
