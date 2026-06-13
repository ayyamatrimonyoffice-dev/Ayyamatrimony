const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins ?? []),
      './plugins/withGoogleServices.js',
      '@react-native-community/datetimepicker',
    ],
  },
};
