/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./App.{js,jsx,ts,tsx}",
        "./app/**/*.{js,jsx,ts,tsx}",
        "./src/**/*.{js,jsx,ts,tsx}"
    ],
    presets: [require("nativewind/preset")],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                'zalo-blue-primary': '#0068FF',
                'zalo-blue-secondary': '#0054CC',
                'zalo-background': '#F2F4F7',
            },
        },
    },
    plugins: [],
}
