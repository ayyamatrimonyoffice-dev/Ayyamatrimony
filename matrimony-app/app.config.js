const appJson = require('./app.json');

module.exports = {
  expo: {
    ...appJson.expo,
    plugins: [
      ...(appJson.expo.plugins ?? []),
      [
        'expo-splash-screen',
        {
          image: './assets/lotus-logo.png',
          imageWidth: 180,
          resizeMode: 'contain',
          backgroundColor: '#FDF6EC',
        },
      ],
      './plugins/withGoogleServices.js',
      '@react-native-community/datetimepicker',
    ],
  },
};
