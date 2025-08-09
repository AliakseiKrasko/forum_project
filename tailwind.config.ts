import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";

const config: Config = {
    darkMode: ["class", '[data-theme="dark"]'],
    content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
    theme: {
        extend: {},
    },
    plugins: [animate],
};
export default config;