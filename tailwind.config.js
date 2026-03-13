/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./public/index.html", "./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            fontFamily: {
                display: ["Outfit", "sans-serif"],
            },
            boxShadow: {
                card: "0 12px 32px rgba(15, 23, 42, 0.08)",
            },
        },
    },
    plugins: [],
};
