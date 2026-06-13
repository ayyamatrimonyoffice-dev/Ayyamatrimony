const {
  withProjectBuildGradle,
  withAppBuildGradle,
  withDangerousMod,
} = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const GOOGLE_SERVICES_VERSION = '4.4.4';
const FIREBASE_BOM_VERSION = '34.14.1';

function addClasspath(contents) {
  if (contents.includes('com.google.gms:google-services')) {
    return contents;
  }

  return contents.replace(
    /dependencies\s*\{/,
    `dependencies {\n    classpath('com.google.gms:google-services:${GOOGLE_SERVICES_VERSION}')`,
  );
}

function addAppPlugin(contents) {
  if (contents.includes('com.google.gms.google-services')) {
    return contents;
  }

  return `apply plugin: "com.google.gms.google-services"\n\n${contents}`;
}

function addFirebaseDependencies(contents) {
  if (contents.includes('com.google.firebase:firebase-bom')) {
    return contents;
  }

  const firebaseDeps = `
    // Firebase BoM and Analytics (added by withGoogleServices plugin)
    implementation platform('com.google.firebase:firebase-bom:${FIREBASE_BOM_VERSION}')
    implementation 'com.google.firebase:firebase-analytics'
`;

  if (contents.includes('dependencies {')) {
    return contents.replace(/dependencies\s*\{/, `dependencies {${firebaseDeps}`);
  }

  return `${contents}\n\ndependencies {${firebaseDeps}\n}`;
}

function copyGoogleServices(config) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const source = path.join(projectRoot, 'google-services.json');
      const target = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'google-services.json',
      );

      if (fs.existsSync(source)) {
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.copyFileSync(source, target);
      }

      return config;
    },
  ]);
}

function withGoogleServices(config) {
  config = withProjectBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addClasspath(config.modResults.contents);
    }
    return config;
  });

  config = withAppBuildGradle(config, (config) => {
    if (config.modResults.language === 'groovy') {
      config.modResults.contents = addAppPlugin(config.modResults.contents);
      config.modResults.contents = addFirebaseDependencies(config.modResults.contents);
    }
    return config;
  });

  config = copyGoogleServices(config);

  return config;
}

module.exports = withGoogleServices;
