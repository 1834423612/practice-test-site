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
            backgroundOpacity: {  // 新增：定义背景透明度
                0: '0',
                5: '0.05',
                10: '0.1',
                20: '0.2',
                25: '0.25',
                30: '0.3',
                40: '0.4',
                50: '0.5',
                60: '0.6',
                70: '0.7',
                75: '0.75',
                80: '0.8',
                90: '0.9',
                100: '1',
            },
        },
    },
    plugins: [
        // 自定义插件：增加 .bg-*-opacity 工具类（原来v3风格，仅修改背景不影响容器内容）
        function({ addUtilities, theme, e }) {
            const bgOpacity = theme('backgroundOpacity');
            const newUtilities = Object.keys(bgOpacity).reduce((acc, key) => {
                acc[`.bg-opacity-${key}`] = {
                    '--tw-bg-opacity': bgOpacity[key],
                };
                return acc;
            }, {});
            addUtilities(newUtilities, ['responsive', 'hover']);
        },
        // 自定义插件：增加 .bg-*-opacity 工具类仅用于颜色混合（原方案）
        function({ addUtilities, theme, e }) {
            const newUtilities = {};
            const colors = theme('colors');
            Object.entries(colors).forEach(([name, value]) => {
                if (typeof value === 'string') {
                    newUtilities[`.bg-${e(name)}-opacity`] = {
                        "background-color": `color-mix(in oklch, ${value} var(--tw-opacity, 100%), transparent)`
                    };
                } else if (typeof value === 'object') {
                    Object.entries(value).forEach(([shade, shadeColor]) => {
                        newUtilities[`.bg-${e(name)}-${shade}-opacity`] = {
                            "background-color": `color-mix(in oklch, ${shadeColor} var(--tw-opacity, 100%), transparent)`
                        };
                    });
                }
            });
            addUtilities(newUtilities, ['responsive', 'hover']);
        }
    ],
}
