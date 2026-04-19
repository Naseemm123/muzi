/** @type {import('postcss-load-config').Config} */
const config = {
    plugins: { "@tailwindcss/postcss": {}, autoprefixer: {}, },
    theme: {
        extend: {
        backgroundImage: {
            'radial-gradient': 'radial-gradient(var(--tw-gradient-stops))',
            },
        },
    },
};

export default config;
