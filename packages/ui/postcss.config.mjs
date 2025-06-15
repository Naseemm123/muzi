/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: { "@tailwindcss/postcss": {} },
    theme: {
        extend: {
        backgroundImage: {
            'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
};

export default config;
