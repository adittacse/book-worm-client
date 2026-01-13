/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./src/app/**/*.{js,jsx,mdx}",
        "./src/pages/**/*.{js,jsx,mdx}",
        "./src/components/**/*.{js,jsx,mdx}",
        "./src/lib/**/*.{js,jsx,mdx}",
    ],
    theme: {
        extend: {},
    },
    plugins: [require("daisyui")],

    daisyui: {
        // white/clean UI by default
        themes: ["light"],
        darkTheme: "light",
        base: true,
        styled: true,
        utils: true,
        logs: false,
        rtl: false,
        prefix: "",
    },
};
