// Lets the app import the messages and the website's language labels, outside this folder.
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);
config.watchFolders = ['../content', '../website'].map((folder) => path.resolve(__dirname, folder));
module.exports = config;
