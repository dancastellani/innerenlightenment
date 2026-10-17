// Lets the app import the messages and the website's language labels, outside this folder.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.watchFolders = ['../content', '../website'].map((folder) => path.resolve(__dirname, folder));

// Expo Go on Android lacks the native module for push topics, and expo-notifications loads it on import,
// so the app crashes on start (issue #83). We don't use topics: load the package's stand-in instead.
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === './TopicSubscriptionModule' && context.originModulePath.includes('expo-notifications')) {
    const filePath = path.resolve(__dirname, 'node_modules/expo-notifications/build/TopicSubscriptionModule.js');
    return { type: 'sourceFile', filePath };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
