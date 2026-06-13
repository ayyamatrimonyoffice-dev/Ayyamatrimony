// Always run Expo from matrimony-app. This file re-exports that config
// so Metro picks up Firebase fixes even if the dev server starts one level up.
module.exports = require('./matrimony-app/metro.config.js');
