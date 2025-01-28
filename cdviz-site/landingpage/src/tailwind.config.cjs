const { addDynamicIconSelectors } = require("@iconify/tailwind");

/** @type {import('tailwindcss').Config} */
module.exports = {
  plugins: [
    // https://iconify.design/docs/usage/css/tailwind/#installation
    // Iconify plugin, requires writing list of icon sets to load
    // addIconSelectors(["simple-icons" /*, 'logos'*/]),
    addDynamicIconSelectors(),
  ],
};
