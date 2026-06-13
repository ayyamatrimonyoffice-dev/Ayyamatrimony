const { getDefaultConfig } = require('expo/metro-config');
const fs = require('fs');
const path = require('path');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

config.resolver.unstable_enablePackageExports = true;
config.resolver.unstable_conditionNames = ['browser', 'react-native', 'import', 'require'];
config.resolver.resolverMainFields = ['react-native', 'browser', 'main', 'module'];

const webchannelFiles = {
  'bloom-blob': path.join(
    projectRoot,
    'node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/bloom_blob_es2018.js',
  ),
  'webchannel-blob': path.join(
    projectRoot,
    'node_modules/@firebase/webchannel-wrapper/dist/webchannel-blob/webchannel_blob_es2018.js',
  ),
};

function exists(filePath) {
  try {
    return fs.existsSync(filePath);
  } catch {
    return false;
  }
}

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('@firebase/webchannel-wrapper/')) {
    const subpath = moduleName.split('/').pop();
    const filePath = webchannelFiles[subpath];
    if (filePath && exists(filePath)) {
      return { type: 'sourceFile', filePath };
    }
  }

  if (moduleName.includes('index.node.cjs.js') || moduleName.includes('index.node.mjs')) {
    const browserPath = moduleName
      .replace('index.node.cjs.js', 'index.esm.js')
      .replace('index.node.mjs', 'index.esm.js');

    if (browserPath !== moduleName && exists(browserPath)) {
      return { type: 'sourceFile', filePath: browserPath };
    }
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
